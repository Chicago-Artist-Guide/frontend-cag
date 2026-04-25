import React, { useEffect, useState } from 'react';
import { useUserContext } from '../../context/UserContext';
import { CompanyMatchList } from './CompanyMatchList';
import { RoleMatchesFilterBar } from './RoleMatchesFilterBar';
import { TalentMatchesFilterBar } from './TalentMatchesFilterBar';
import { TalentMatchList } from './TalentMatchList';

export const MatchesPageContainer = () => {
  const { account } = useUserContext();
  const [accountType, setAccountType] = useState(null);

  useEffect(() => {
    const accountData = account?.data;

    if (accountData) {
      setAccountType(accountData.type);
    }
  }, [account]);

  return (
    <div className="flex flex-col gap-6 pt-3 lg:flex-row lg:gap-12">
      {accountType !== null ? (
        <>
          {accountType === 'company' && (
            <div className="w-full flex-none lg:w-auto">
              <TalentMatchesFilterBar />
            </div>
          )}
          {accountType === 'individual' && (
            <div className="w-full flex-none lg:w-auto">
              <RoleMatchesFilterBar />
            </div>
          )}
          <div className="w-full flex-1">
            {accountType === 'individual' ? (
              <CompanyMatchList />
            ) : (
              <TalentMatchList />
            )}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};
