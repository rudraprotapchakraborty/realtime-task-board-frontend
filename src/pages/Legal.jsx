const pages = {
  privacy: {
    title: "Privacy Policy",
    updated: "November 2026",
    sections: [
      ["What we collect", "Your name, email address and, if you add one, a profile photo. If you sign in with Google we receive your name, email and profile picture from Google. We also store the tasks you create."],
      ["How we use it", "To sign you in, show your own board, send one-time codes to confirm your email and reset your password, and keep your board in sync across your devices. We do not sell your data and we do not show ads."],
      ["Who can see your tasks", "Only you. Tasks belong to your account. Administrators can see member names, emails and how many tasks each member has, but not the contents of anyone's tasks."],
      ["Where it is stored", "Account and task data is stored in a MongoDB database. Profile photos are hosted on an image service. Emails are sent through our mail provider."],
      ["Your choices", "You can change your name, photo, email and password in Account settings, and delete your account at any time. Deleting it removes your profile and every task you created."],
      ["Cookies and storage", "We keep your sign-in token and your light or dark theme preference in your browser's local storage. There are no tracking or advertising cookies."],
      ["Test accounts", "The shared test accounts on the sign-in page are public. Do not store anything private in them."],
      ["Contact", "Questions about your data? Email the address in the footer of the project's GitHub page."],
    ],
  },
  terms: {
    title: "Terms of Use",
    updated: "November 2026",
    sections: [
      ["Using Task Board", "Task Board is a free personal project for organising tasks. By creating an account or signing in you agree to these terms."],
      ["Your account", "Keep your password safe. You are responsible for activity on your account. Tell us if you think someone else has access to it."],
      ["Your content", "The tasks you write belong to you. Do not store anything unlawful, abusive or that you do not have the right to keep."],
      ["Acceptable use", "Do not try to break, overload or gain unauthorised access to the service or to other people's data, and do not use automated tools to create accounts or tasks in bulk."],
      ["Test accounts", "Shared test accounts are provided for trying the app. They are reset from time to time and some actions, such as changing the email or deleting the account, are disabled."],
      ["Availability", "The service is provided as is, with no guarantee that it will always be available or free of errors. Features may change or be removed."],
      ["Ending your account", "You can delete your account at any time in Account settings. We may suspend accounts that break these terms."],
      ["Changes", "We may update these terms. Continuing to use Task Board after a change means you accept the new version."],
    ],
  },
};

export default function Legal({ page }) {
  const doc = pages[page];
  return (
    <article className="frame max-w-3xl py-14">
      <span className="eyeline">Legal</span>
      <h1 className="display mt-4 text-[clamp(34px,5vw,56px)]">{doc.title}</h1>
      <p className="mt-3 text-sm text-muted">Last updated {doc.updated}</p>
      <div className="mt-10 space-y-8">
        {doc.sections.map(([heading, text]) => (
          <section key={heading}>
            <h2 className="text-lg font-bold tracking-tight">{heading}</h2>
            <p className="mt-2 leading-relaxed text-muted">{text}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
