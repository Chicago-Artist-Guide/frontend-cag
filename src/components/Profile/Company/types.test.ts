import { Role } from './types';

describe('Role Type Definition', () => {
  describe('union field', () => {
    it('should accept union as string array', () => {
      const roleWithUnionArray: Role = {
        role_id: 'test-role-1',
        role_name: 'Lead Actor',
        type: 'On-Stage',
        union: ['Non-Union', 'AEA (actors, stage managers, directors)']
      };

      expect(roleWithUnionArray.union).toBeInstanceOf(Array);
      expect(roleWithUnionArray.union).toHaveLength(2);
      expect(roleWithUnionArray.union).toContain('Non-Union');
      expect(roleWithUnionArray.union).toContain(
        'AEA (actors, stage managers, directors)'
      );
    });

    it('should accept empty union array', () => {
      const roleWithEmptyUnion: Role = {
        role_id: 'test-role-2',
        role_name: 'Supporting Actor',
        type: 'On-Stage',
        union: []
      };

      expect(roleWithEmptyUnion.union).toBeInstanceOf(Array);
      expect(roleWithEmptyUnion.union).toHaveLength(0);
    });

    it('should accept single union value in array', () => {
      const roleWithSingleUnion: Role = {
        role_id: 'test-role-3',
        role_name: 'Stage Manager',
        type: 'Off-Stage',
        union: ['AEA (actors, stage managers, directors)']
      };

      expect(roleWithSingleUnion.union).toBeInstanceOf(Array);
      expect(roleWithSingleUnion.union).toHaveLength(1);
      expect(roleWithSingleUnion.union?.[0]).toBe(
        'AEA (actors, stage managers, directors)'
      );
    });

    it('should accept multiple union values in array', () => {
      const roleWithMultipleUnions: Role = {
        role_id: 'test-role-4',
        role_name: 'Technical Director',
        type: 'Off-Stage',
        union: [
          'Non-Union',
          'IATSE (stage hands)',
          'Union Scenic Artist (designers)'
        ]
      };

      expect(roleWithMultipleUnions.union).toBeInstanceOf(Array);
      expect(roleWithMultipleUnions.union).toHaveLength(3);
    });

    it('should accept undefined union field', () => {
      const roleWithoutUnion: Role = {
        role_id: 'test-role-5',
        role_name: 'Ensemble',
        type: 'On-Stage'
      };

      expect(roleWithoutUnion.union).toBeUndefined();
    });

    it('should accept all union options in array', () => {
      const roleWithAllUnions: Role = {
        role_id: 'test-role-6',
        role_name: 'Director',
        type: 'Off-Stage',
        union: [
          'Non-Union',
          'AEA (actors, stage managers, directors)',
          'IATSE (stage hands)',
          'Union Scenic Artist (designers)'
        ]
      };

      expect(roleWithAllUnions.union).toBeInstanceOf(Array);
      expect(roleWithAllUnions.union).toHaveLength(4);
      expect(roleWithAllUnions.union).toContain('Non-Union');
      expect(roleWithAllUnions.union).toContain(
        'AEA (actors, stage managers, directors)'
      );
      expect(roleWithAllUnions.union).toContain('IATSE (stage hands)');
      expect(roleWithAllUnions.union).toContain(
        'Union Scenic Artist (designers)'
      );
    });
  });
});
