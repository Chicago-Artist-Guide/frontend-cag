import { IndividualProfile } from './types';

describe('IndividualProfile Type Definition', () => {
  describe('union_status field', () => {
    it('should accept union_status as string array', () => {
      const profileWithUnionArray: Partial<IndividualProfile> = {
        union_status: ['Non-Union', 'AEA (actors, stage managers, directors)']
      };

      expect(profileWithUnionArray.union_status).toBeInstanceOf(Array);
      expect(profileWithUnionArray.union_status).toHaveLength(2);
      expect(profileWithUnionArray.union_status).toContain('Non-Union');
      expect(profileWithUnionArray.union_status).toContain(
        'AEA (actors, stage managers, directors)'
      );
    });

    it('should accept empty union_status array', () => {
      const profileWithEmptyUnion: Partial<IndividualProfile> = {
        union_status: []
      };

      expect(profileWithEmptyUnion.union_status).toBeInstanceOf(Array);
      expect(profileWithEmptyUnion.union_status).toHaveLength(0);
    });

    it('should accept single union_status value in array', () => {
      const profileWithSingleUnion: Partial<IndividualProfile> = {
        union_status: ['AEA (actors, stage managers, directors)']
      };

      expect(profileWithSingleUnion.union_status).toBeInstanceOf(Array);
      expect(profileWithSingleUnion.union_status).toHaveLength(1);
      expect(profileWithSingleUnion.union_status?.[0]).toBe(
        'AEA (actors, stage managers, directors)'
      );
    });

    it('should accept multiple union_status values in array', () => {
      const profileWithMultipleUnions: Partial<IndividualProfile> = {
        union_status: [
          'Non-Union',
          'IATSE (stage hands)',
          'Union Scenic Artist (designers)'
        ]
      };

      expect(profileWithMultipleUnions.union_status).toBeInstanceOf(Array);
      expect(profileWithMultipleUnions.union_status).toHaveLength(3);
    });

    it('should accept all union options in array', () => {
      const profileWithAllUnions: Partial<IndividualProfile> = {
        union_status: [
          'Non-Union',
          'AEA (actors, stage managers, directors)',
          'IATSE (stage hands)',
          'Union Scenic Artist (designers)'
        ]
      };

      expect(profileWithAllUnions.union_status).toBeInstanceOf(Array);
      expect(profileWithAllUnions.union_status).toHaveLength(4);
      expect(profileWithAllUnions.union_status).toContain('Non-Union');
      expect(profileWithAllUnions.union_status).toContain(
        'AEA (actors, stage managers, directors)'
      );
      expect(profileWithAllUnions.union_status).toContain(
        'IATSE (stage hands)'
      );
      expect(profileWithAllUnions.union_status).toContain(
        'Union Scenic Artist (designers)'
      );
    });
  });
});
