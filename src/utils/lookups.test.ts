import {
  ethnicities,
  roleGenders,
  roleSpecificGenders,
  unionOptions,
  UnionOption
} from './lookups';
import { ethnicityTypes } from '../components/SignUp/Individual/types';

describe('Union Options Type Definitions', () => {
  describe('unionOptions constant', () => {
    it('should contain all expected union values', () => {
      const expectedValues = [
        'Non-Union',
        'AEA (actors, stage managers, directors)',
        'IATSE (stage hands)',
        'Union Scenic Artist (designers)'
      ];

      expect(unionOptions).toEqual(expectedValues);
      expect(unionOptions).toHaveLength(4);
    });

    it('should contain Non-Union as first option', () => {
      expect(unionOptions[0]).toBe('Non-Union');
    });

    it('should contain AEA option', () => {
      expect(unionOptions).toContain('AEA (actors, stage managers, directors)');
    });

    it('should contain IATSE option', () => {
      expect(unionOptions).toContain('IATSE (stage hands)');
    });

    it('should contain Union Scenic Artist option', () => {
      expect(unionOptions).toContain('Union Scenic Artist (designers)');
    });
  });

  describe('UnionOption type', () => {
    it('should accept valid union option values', () => {
      const validOption1: UnionOption = 'Non-Union';
      const validOption2: UnionOption =
        'AEA (actors, stage managers, directors)';
      const validOption3: UnionOption = 'IATSE (stage hands)';
      const validOption4: UnionOption = 'Union Scenic Artist (designers)';

      expect(validOption1).toBe('Non-Union');
      expect(validOption2).toBe('AEA (actors, stage managers, directors)');
      expect(validOption3).toBe('IATSE (stage hands)');
      expect(validOption4).toBe('Union Scenic Artist (designers)');
    });
  });
});

describe('DEV-484 On-Stage Role Workflow (ethnicity & character gender)', () => {
  describe('ethnicities', () => {
    it('should not include umbrella "Asian"; only granular Asian options', () => {
      expect(ethnicities).not.toContain('Asian');
      expect(ethnicities).toContain('East Asian (ex. China, Korea, Japan)');
      expect(ethnicities).toContain(
        'Southeast Asian (ex. Cambodia, Thailand, Vietnam)'
      );
      expect(ethnicities).toContain(
        'South Asian (ex. Bangladesh, India, Pakistan)'
      );
      expect(ethnicities).toContain(
        'Central & West Asian (ex. Afghanistan, Iran, Uzbekistan)'
      );
    });
  });

  describe('ethnicityTypes (Asian)', () => {
    it('Asian should have only granular values (no parent as selectable in modal)', () => {
      const asian = ethnicityTypes.find((e) => e.name === 'Asian');
      expect(asian).toBeDefined();
      expect(asian?.values).toHaveLength(4);
      expect(asian?.values).toContain('East Asian (ex. China, Korea, Japan)');
      expect(asian?.values).toContain(
        'Southeast Asian (ex. Cambodia, Thailand, Vietnam)'
      );
      expect(asian?.values).toContain(
        'South Asian (ex. Bangladesh, India, Pakistan)'
      );
      expect(asian?.values).toContain(
        'Central & West Asian (ex. Afghanistan, Iran, Uzbekistan)'
      );
    });
  });

  describe('roleGenders and roleSpecificGenders', () => {
    it('should include Nonbinary in roleGenders', () => {
      expect(roleGenders).toContain('Nonbinary');
      expect(roleGenders).toContain('Open to all genders');
      expect(roleGenders).toContain('Woman');
      expect(roleGenders).toContain('Man');
    });

    it('roleSpecificGenders should be Man, Woman, Nonbinary for multi-select', () => {
      expect(roleSpecificGenders).toEqual(['Man', 'Woman', 'Nonbinary']);
    });
  });
});
