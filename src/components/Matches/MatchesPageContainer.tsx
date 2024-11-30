import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../context/UserContext';
import { CompanyMatchList } from './CompanyMatchList';
import { TalentMatchesFilterBar } from './TalentMatchesFilterBar';
import { TalentMatchList } from './TalentMatchList';
import { CompanyMatchesFilterBar } from './CompanyMatchesFilterBar';

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
    <div className="flex gap-6 pt-3 xl:gap-12">
      {accountType !== null ? (
        <>
          <div className="flex-none">
            {accountType === 'individual' ? (
              <CompanyMatchesFilterBar />
            ) : (
              <TalentMatchesFilterBar />
            )}
          </div>
          <div className="flex-initial">
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
