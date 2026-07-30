// Escape user-supplied text before interpolating it into an HTML email body.
//
// React escapes interpolated values automatically, but these templates are
// hand-built HTML strings written to the `mail` collection and rendered by the
// recipient's email client, so nothing escapes them for us.
//
// Mail clients block <script>, so this is not browser XSS. The real risk is
// content injection into a staff inbox: an attacker can inject <a> phishing
// links, <img> tracking pixels, or spoof the whole message body so it appears
// to come from Chicago Artist Guide itself. Attribute contexts (a mailto:
// href) are the sharpest edge, which is why quotes are escaped too.
//
// NOTE: this is defence in depth only. It does NOT address the fact that
// `mail` is client-writable (`allow create: if true` in firestore.rules), so
// an attacker can bypass any form and write the document directly.
export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Escape first, then convert newlines — otherwise the <br> tags we insert
// would themselves be escaped.
export const escapeHtmlWithLineBreaks = (value: string): string =>
  escapeHtml(value).replace(/\n/g, '<br>');
