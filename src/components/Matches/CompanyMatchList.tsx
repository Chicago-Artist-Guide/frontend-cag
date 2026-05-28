import React, { useEffect, useState } from 'react';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { useRoleMatches } from '../../context/RoleMatchContext';
import { useUserContext } from '../../context/UserContext';
import { CompanyMatchCard } from './CompanyMatchCard';
import {
  getTalentRoleFavorite,
  getTheaterTalentMatch,
  setTalentRoleFavorite
} from './api';
import { ProductionRole } from './types';
import { roleMatchesTalentStatusFilters } from './talentMatchStatus';

type RoleState = {
  isFavorite: boolean;
  matchStatus: boolean | null;
};

const buildKey = (role: ProductionRole) =>
  `${role.productionId}_${role.role_id}`;

export const CompanyMatchList = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const { account } = useUserContext();
  const { roles, filters } = useRoleMatches();
  const [states, setStates] = useState<Record<string, RoleState>>({});
  const [loadingStates, setLoadingStates] = useState(true);

  const talentAccountId = account?.ref?.id || '';

  useEffect(() => {
    let cancelled = false;

    const loadStates = async () => {
      if (!talentAccountId || roles.length === 0) {
        setStates({});
        setLoadingStates(false);
        return;
      }
      setLoadingStates(true);

      const entries: [string, RoleState][] = await Promise.all(
        roles.map(async (role) => {
          const [favorite, match] = await Promise.all([
            getTalentRoleFavorite(
              firebaseFirestore,
              talentAccountId,
              role.productionId,
              role.role_id || ''
            ),
            getTheaterTalentMatch(
              firebaseFirestore,
              role.productionId,
              role.role_id || '',
              talentAccountId,
              'talent'
            )
          ]);

          return [
            buildKey(role),
            {
              isFavorite: favorite,
              matchStatus: match ? match.status : null
            }
          ];
        })
      );

      if (cancelled) return;

      setStates(Object.fromEntries(entries));
      setLoadingStates(false);
    };

    loadStates();

    return () => {
      cancelled = true;
    };
  }, [firebaseFirestore, talentAccountId, roles]);

  const onToggleFavorite = async (role: ProductionRole) => {
    if (!talentAccountId) return;
    const key = buildKey(role);
    const next = !states[key]?.isFavorite;

    await setTalentRoleFavorite(
      firebaseFirestore,
      talentAccountId,
      role.productionId,
      role.role_id || '',
      next
    );

    setStates((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { matchStatus: null, isFavorite: false }),
        isFavorite: next
      }
    }));
  };

  const selectedStatuses = filters.matchStatus || [];

  const filteredRoles = roles.filter((role) =>
    roleMatchesTalentStatusFilters(states[buildKey(role)], selectedStatuses)
  );

  if (loadingStates) {
    return <p>Loading...</p>;
  }

  if (filteredRoles.length === 0) {
    return <p>No matches found</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {filteredRoles.map((role: ProductionRole) => {
        const state = states[buildKey(role)];
        return (
          <CompanyMatchCard
            key={`${role.role_id}-CompanyMatchCard`}
            role={role}
            isFavorite={!!state?.isFavorite}
            onToggleFavorite={() => onToggleFavorite(role)}
          />
        );
      })}
    </div>
  );
};
