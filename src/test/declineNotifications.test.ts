import { describe, it, expect } from 'vitest';
import {
  theaterDeclineArtistMessage,
  theaterDeclineArtistEmailSubject,
  theaterDeclineArtistEmailText,
  theaterDeclineArtistEmailHtml,
  theaterToArtistMessage,
  theaterToArtistEmailText,
  stripEmailCtas
} from '../components/Messages/messages';

describe('declineNotifications', () => {
  const roleName = 'Lead Actor';
  const productionName = 'Summer Musical';
  const theaterName = 'Chicago Theater';

  describe('theaterDeclineArtistMessage', () => {
    it('provides the short in-app decline copy', () => {
      const result = theaterDeclineArtistMessage(roleName, theaterName);
      expect(result).toBe(
        `Thank you for your interest in ${roleName} with ${theaterName}. We have decided to move forward with other candidates at this time, but we encourage you to apply for other roles in the future.`
      );
    });
  });

  describe('theaterDeclineArtistEmailSubject', () => {
    it('interpolates role and production names', () => {
      const result = theaterDeclineArtistEmailSubject(roleName, productionName);
      expect(result).includes(roleName);
      expect(result).includes(productionName);
    });

    it('starts with CAG:', () => {
      const result = theaterDeclineArtistEmailSubject(roleName, productionName);
      expect(result).toMatch(/^CAG:/);
    });
  });

  describe('theaterDeclineArtistEmailText', () => {
    it('interpolates theatre and role names with close-role copy', () => {
      const result = theaterDeclineArtistEmailText(theaterName, roleName);
      expect(result).toBe(
        `Thank you for your interest in ${roleName} with ${theaterName}. We have decided to move forward with other candidates at this time, but we encourage you to apply for other roles in the future.`
      );
    });
  });

  describe('theaterDeclineArtistEmailHtml', () => {
    it('interpolates theatre and role names with close-role copy', () => {
      const result = theaterDeclineArtistEmailHtml(theaterName, roleName);
      expect(result).includes(theaterName);
      expect(result).includes(roleName);
      expect(result).toMatch(/move forward with other candidates/);
    });

    it('contains strong tags', () => {
      const result = theaterDeclineArtistEmailHtml(theaterName, roleName);
      expect(result).includes('<strong>');
    });
  });

  describe('theaterToArtistMessage', () => {
    it('is shorter than the email body sent to talent', () => {
      const email = 'contact@example.com';

      expect(
        theaterToArtistEmailText(theaterName, roleName, productionName, email)
      ).toContain('login to CAG and go to your Messages to respond');
      expect(
        theaterToArtistMessage(roleName, productionName, email)
      ).not.toContain('login to CAG');
      expect(
        stripEmailCtas(
          theaterToArtistEmailText(theaterName, roleName, productionName, email)
        )
      ).not.toContain('login to CAG');
    });
  });
});
