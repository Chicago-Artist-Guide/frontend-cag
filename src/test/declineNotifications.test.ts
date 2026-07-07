import { describe, it, expect } from 'vitest';
import {
  theaterDeclineArtistMessage,
  theaterDeclineArtistEmailSubject,
  theaterDeclineArtistEmailText,
  theaterDeclineArtistEmailHtml
} from '../components/Messages/messages';

describe('declineNotifications', () => {
  const roleName = 'Lead Actor';
  const productionName = 'Summer Musical';
  const theaterName = 'Chicago Theater';

  describe('theaterDeclineArtistMessage', () => {
    it('interpolates role and theatre names with close-role copy', () => {
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
});
