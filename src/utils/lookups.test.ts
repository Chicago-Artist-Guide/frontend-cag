import { unionOptions, UnionOption } from './lookups';

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
