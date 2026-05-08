import {
  ethnicityTypes,
  flattenedEthnicityTypes,
  genders
} from '../components/SignUp/Individual/types';
import { genders as roleGenders } from '../utils/lookups';

describe('DEV-488: site testing feedback', () => {
  describe('Item 1 + 8: Asian parent option excluded from selectable ethnicities', () => {
    it('flattens to granular Asian sub-options without the Asian parent', () => {
      // The Asian umbrella has values, so flattenedEthnicityTypes should
      // include those sub-categories instead of the parent label
      expect(flattenedEthnicityTypes).not.toContain('Asian');
      expect(flattenedEthnicityTypes).toContain(
        'East Asian (ex. China, Korea, Japan)'
      );
      expect(flattenedEthnicityTypes).toContain(
        'Southeast Asian (ex. Cambodia, Thailand, Vietnam)'
      );
      expect(flattenedEthnicityTypes).toContain(
        'South Asian (ex. Bangladesh, India, Pakistan)'
      );
      expect(flattenedEthnicityTypes).toContain(
        'Central & West Asian (ex. Afghanistan, Iran, Uzbekistan)'
      );
    });

    it('keeps the Asian umbrella entry around for grouping/matching purposes', () => {
      const asian = ethnicityTypes.find((e) => e.name === 'Asian');
      expect(asian).toBeDefined();
      expect(asian?.values.length).toBeGreaterThan(0);
    });
  });

  describe('Item 6: Gender options do not include "I chose not to respond"', () => {
    it('omits "I chose not to respond" from individual signup genders', () => {
      const lower = genders.map((g) => g.toLowerCase());
      expect(lower).not.toContain('i chose not to respond');
      expect(lower).not.toContain('i choose not to respond');
      expect(lower).not.toContain('prefer not to respond');
    });

    it('omits "I chose not to respond" from role gender options', () => {
      const lower = roleGenders.map((g) => g.toLowerCase());
      expect(lower).not.toContain('i chose not to respond');
      expect(lower).not.toContain('i choose not to respond');
      expect(lower).not.toContain('prefer not to respond');
    });

    it('individual signup genders are exactly the supported set', () => {
      expect([...genders]).toEqual(['Cis Woman', 'Cis Man', 'Trans/Nonbinary']);
    });
  });
});
