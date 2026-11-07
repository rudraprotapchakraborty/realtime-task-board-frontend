import { useState } from "react";

const initialsOf = (name) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .map((p) => Array.from(p)[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * Profile picture, or initials when there is none (or it fails to load).
 * Google photos refuse to load when a referrer is sent, hence referrerPolicy.
 */
export default function Avatar({ name, url, size = 36, className = "" }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const showImage = Boolean(url) && failedUrl !== url;

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-soft font-bold text-brand ring-1 ring-line ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}
    >
      {showImage ? (
        <img
          src={url}
          alt={name ? `${name}'s photo` : "Profile photo"}
          width={size}
          height={size}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailedUrl(url)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden={Boolean(name)}>{initialsOf(name)}</span>
      )}
    </span>
  );
}
