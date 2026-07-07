// constants
export const UNKNOWN_ROLE = '(Unknown Role)';
export const UNKNOWN_PRODUCTION = '(Unknown Production)';
export const NO_EMAIL = '(Email N/A)';

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
