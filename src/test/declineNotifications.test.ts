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
    it('interpolates role and production names', () => {
      const result = theaterDeclineArtistMessage(roleName, productionName);
      expect(result).includes(roleName);
      expect(result).includes(productionName);
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
    it('interpolates theater, role, and production names', () => {
      const result = theaterDeclineArtistEmailText(
        theaterName,
        roleName,
        productionName
      );
      expect(result).includes(theaterName);
      expect(result).includes(roleName);
      expect(result).includes(productionName);
    });
  });

  describe('theaterDeclineArtistEmailHtml', () => {
    it('interpolates theater, role, and production names', () => {
      const result = theaterDeclineArtistEmailHtml(
        theaterName,
        roleName,
        productionName
      );
      expect(result).includes(theaterName);
      expect(result).includes(roleName);
      expect(result).includes(productionName);
    });

    it('contains strong tags', () => {
      const result = theaterDeclineArtistEmailHtml(
        theaterName,
        roleName,
        productionName
      );
      expect(result).includes('<strong>');
    });
  });
});
