import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import api, { CLIENT_ID, getErrorMessage } from "../lib/api";

const POLL_MS = 4000;
// Same origin in development (the Vite proxy forwards it); an explicit URL when one is configured
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? window.location.origin : "");

/**
 * The signed-in user's tasks, kept in sync with the server.
 *
 * Changes made here are applied immediately and sent to the API. Changes made
 * elsewhere (another tab, another device) arrive over a WebSocket when the
 * server supports it, and otherwise by polling a tiny "version" endpoint.
 */
export function useBoard(token) {
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(SOCKET_URL ? "connecting" : "polling"); // live | polling | connecting | offline
  const versionRef = useRef(null);
  const pausedRef = useRef(false); // true while a card is being dragged
  const pendingRef = useRef(false);

  const load = useCallback(async () => {
    if (pausedRef.current) {
      pendingRef.current = true;
      return;
    }
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.data);
      setError(null);
    } catch (err) {
      if (err?.response?.status !== 401) setError(getErrorMessage(err, "Could not load your tasks."));
    }
  }, []);

  useEffect(() => {
    // Loading starts when the user signs in, so this is a plain "sync from the server" effect
    load();
  }, [load, token]);

  // Live updates: WebSocket first, polling when that is not possible
  useEffect(() => {
    if (!token) return;
    let socket;
    let timer;
    let stopped = false;
    let live = false;

    const poll = async () => {
      if (stopped || live || document.hidden) return;
      try {
        const res = await api.get("/tasks/version");
        const next = res.data.data.version;
        if (versionRef.current !== null && versionRef.current !== next) await load();
        versionRef.current = next;
        setMode("polling");
      } catch {
        if (!navigator.onLine) setMode("offline");
      }
    };
    const startPolling = () => {
      clearInterval(timer);
      poll();
      timer = setInterval(poll, POLL_MS);
    };

    if (SOCKET_URL) {
      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnectionAttempts: 3,
        timeout: 4000,
      });
      socket.on("connect", () => {
        live = true;
        clearInterval(timer);
        setMode("live");
        load(); // catch up on anything missed while disconnected
      });
      socket.on("tasks:changed", (event) => {
        if (event?.origin !== CLIENT_ID) load();
      });
      const fallBack = () => {
        live = false;
        startPolling();
      };
      socket.on("disconnect", fallBack);
      socket.on("connect_error", fallBack);
    } else {
      startPolling();
    }

    const refresh = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("online", refresh);
    return () => {
      stopped = true;
      clearInterval(timer);
      socket?.disconnect();
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [token, load]);

  const fail = useCallback(
    (err, fallback) => {
      toast.error(getErrorMessage(err, fallback));
      load();
    },
    [load]
  );

  const addTask = useCallback(async (input) => {
    const res = await api.post("/tasks", input);
    setTasks((prev) => [...(prev ?? []), res.data.data]);
    return res.data.data;
  }, []);

  const updateTask = useCallback(
    async (id, patch) => {
      setTasks((prev) => prev?.map((t) => (t.id === id ? { ...t, ...patch } : t)) ?? prev);
      try {
        const res = await api.patch(`/tasks/${id}`, patch);
        setTasks((prev) => prev?.map((t) => (t.id === id ? res.data.data : t)) ?? prev);
      } catch (err) {
        fail(err, "Could not save that change.");
      }
    },
    [fail]
  );

  const removeTask = useCallback(
    async (id) => {
      setTasks((prev) => prev?.filter((t) => t.id !== id) ?? prev);
      try {
        await api.delete(`/tasks/${id}`);
      } catch (err) {
        fail(err, "Could not delete the task.");
      }
    },
    [fail]
  );

  const clearDone = useCallback(async () => {
    setTasks((prev) => prev?.filter((t) => t.status !== "DONE") ?? prev);
    try {
      await api.delete("/tasks", { params: { status: "DONE" } });
    } catch (err) {
      fail(err, "Could not clear the finished tasks.");
    }
  }, [fail]);

  const pauseSync = useCallback((paused) => {
    pausedRef.current = paused;
    if (!paused && pendingRef.current) {
      pendingRef.current = false;
      load();
    }
  }, [load]);

  return { tasks, setTasks, error, mode, addTask, updateTask, removeTask, clearDone, pauseSync, reload: load };
}
