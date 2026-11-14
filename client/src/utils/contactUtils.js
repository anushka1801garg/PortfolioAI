/**
 * Contact and webmail utility helpers.
 * Prevents triggering OS-level 'mailto' dialogs ("Select an app to open this 'mailto' link")
 * by directing users to webmail services or clipboard copying.
 */

/**
 * Generates a Gmail web compose URL with optional prefilled subject and body.
 */
export const getGmailComposeUrl = (email, subject = "", body = "") => {
  if (!email) return "#";
  const params = new URLSearchParams();
  params.set("view", "cm");
  params.set("fs", "1");
  params.set("to", email);
  if (subject) params.set("su", subject);
  if (body) params.set("body", body);
  return `https://mail.google.com/mail/?${params.toString()}`;
};

/**
 * Generates an Outlook web compose URL with optional prefilled subject and body.
 */
export const getOutlookComposeUrl = (email, subject = "", body = "") => {
  if (!email) return "#";
  const params = new URLSearchParams();
  params.set("to", email);
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
};

/**
 * Safely parses any mailto: URL to extract recipient email, subject, and body.
 */
export const parseMailto = (mailtoUrl = "") => {
  try {
    const raw = mailtoUrl.replace(/^mailto:/i, "");
    const [emailPart, queryPart] = raw.split("?");
    const email = decodeURIComponent(emailPart || "").trim();
    const searchParams = new URLSearchParams(queryPart || "");
    const subject = searchParams.get("subject") || searchParams.get("su") || "";
    const body = searchParams.get("body") || "";
    return { email, subject, body };
  } catch {
    return { email: "", subject: "", body: "" };
  }
};

/**
 * Opens webmail composer in a new tab without ever touching the OS mailto handler.
 */
export const openWebmailCompose = (email, subject = "", body = "", provider = "gmail") => {
  if (!email) return;
  const url =
    provider === "outlook"
      ? getOutlookComposeUrl(email, subject, body)
      : getGmailComposeUrl(email, subject, body);
  window.open(url, "_blank", "noopener,noreferrer");
};
