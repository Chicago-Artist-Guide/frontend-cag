// constants
export const UNKNOWN_ROLE = '(Unknown Role)';
export const UNKNOWN_PRODUCTION = '(Unknown Production)';
export const NO_EMAIL = '(Email N/A)';

// Some stored thread previews were prefixed when the matching email was
// sent. Threads should show only the conversation copy.
const EMAIL_SENT_PREFIX = /^Email sent:\s*/i;

export const getConversationPreview = (content?: string | null) => {
  if (!content) {
    return '';
  }

  return content.replace(EMAIL_SENT_PREFIX, '').trim();
};

// artist to theater
export const artistToTheaterMessage = (
  roleName: string,
  productionName: string,
  email: string
) =>
  `I'm interested in the role of ${roleName} in ${productionName}. Please provide additional information if interested by emailing me at ${email}.`;
export const artistToTheaterEmailSubject = (
  roleName: string,
  productionName: string
) => `CAG: New Role Application for ${roleName} in ${productionName}`;
export const artistToTheaterEmailText = (
  fullName: string,
  roleName: string,
  productionName: string,
  email: string
) =>
  `My name is ${fullName} and I'm interested in the role of ${roleName} in ${productionName}. Please provide additional information if interested by emailing me at ${email}. You may also login to CAG and go to your Messages to respond.`;
export const artistToTheaterEmailHtml = (
  fullName: string,
  roleName: string,
  productionName: string,
  email: string
) =>
  `<p>My name is <strong>${fullName}</strong> and I'm interested in the role of <strong>${roleName}</strong> in <strong>${productionName}</strong>.</p><p>Please provide additional information if interested by emailing me at ${email}.</p><p>You may also login to CAG and go to your Messages to respond.</p>`;

// theater to artist
export const theaterToArtistMessage = (
  roleName: string,
  productionName: string,
  email: string
) =>
  `We're interested in you for ${roleName} in ${productionName}. Please provide your availability to audition/interview if interested by emailing me at ${email}.`;
export const theaterToArtistEmailSubject = (
  roleName: string,
  productionName: string
) => `CAG: New Role Interest for ${roleName} in ${productionName}`;
export const theaterToArtistEmailText = (
  theaterName: string,
  roleName: string,
  productionName: string,
  email: string
) =>
  `We are ${theaterName} and we're interested in you for the role of ${roleName} in ${productionName}. Please provide your availability to audition/interview if interested by emailing me at ${email}. You may also login to CAG and go to your Messages to respond.`;
export const theaterToArtistEmailHtml = (
  theaterName: string,
  roleName: string,
  productionName: string,
  email: string
) =>
  `<p>We are <strong>${theaterName}</strong> and we're interested in you for the role of <strong>${roleName}</strong> in <strong>${productionName}</strong>.</p><p>Please provide your availability to audition/interview if interested by emailing me at ${email}.</p><p>You may also login to CAG and go to your Messages to respond.</p>`;

// theater decline artist
export const theaterDeclineArtistMessage = (
  roleName: string,
  theaterName: string
) =>
  `Thank you for your interest in ${roleName} with ${theaterName}. We have decided to move forward with other candidates at this time, but we encourage you to apply for other roles in the future.`;
export const theaterDeclineArtistEmailSubject = (
  roleName: string,
  productionName: string
) => `CAG: Application Update for ${roleName} in ${productionName}`;
export const theaterDeclineArtistEmailText = (
  theaterName: string,
  roleName: string
) =>
  `Thank you for your interest in ${roleName} with ${theaterName}. We have decided to move forward with other candidates at this time, but we encourage you to apply for other roles in the future.`;
export const theaterDeclineArtistEmailHtml = (
  theaterName: string,
  roleName: string
) =>
  `<p>Thank you for your interest in <strong>${roleName}</strong> with <strong>${theaterName}</strong>. We have decided to move forward with other candidates at this time, but we encourage you to apply for other roles in the future.</p>`;

const EMAIL_CTA_PATTERNS = [
  /\s*You may also login to CAG and go to your Messages to respond\.?/gi,
  /\s*We encourage you to apply to other roles on Chicago Artist Guide\.?/gi
];

export const stripEmailCtas = (text: string): string => {
  let result = text;
  for (const pattern of EMAIL_CTA_PATTERNS) {
    result = result.replace(pattern, '');
  }
  return result.trim();
};

export const IN_APP_EMAIL_SENT_LABEL = 'Email Sent';

export const resolveTheaterDisplayName = (
  profile?: { theatre_name?: string; theater_name?: string } | null,
  account?: { theater_name?: string; theatre_name?: string } | null
) =>
  [
    profile?.theatre_name,
    profile?.theater_name,
    account?.theater_name,
    account?.theatre_name
  ].find((name) => typeof name === 'string' && name.trim().length > 0) ||
  'Theatre';

export const resolveArtistDisplayName = (
  account?: {
    first_name?: string;
    last_name?: string;
  } | null
) =>
  `${account?.first_name || ''} ${account?.last_name || ''}`.trim() || 'Talent';

/** Sender shown in invitation copy ("We are X" / "My name is X"), never the recipient. */
export const getMatchInvitationSenderName = (
  accountType: 'theater' | 'talent',
  theaterName?: string | null,
  artistName?: string | null
) =>
  accountType === 'theater'
    ? theaterName?.trim() || 'Theatre'
    : artistName?.trim() || 'Talent';

/**
 * The party who already applied sent the invitation email. Accepting their own
 * match from the thread must not send a second copy (often with swapped names).
 */
export const shouldSendMatchInvitationFollowUp = (
  initiatedBy: 'theater' | 'talent' | undefined,
  actingAs: 'theater' | 'talent'
) => initiatedBy !== actingAs;
