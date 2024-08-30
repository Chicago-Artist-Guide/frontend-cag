import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../context/UserContext';
import { CompanyMatchList } from './CompanyMatchList';
import { MatchesFilterBar } from './MatchesFilterBar';
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
    <div className="flex gap-12 pt-3">
      <div className="flex-none">
        {accountType === 'individual' ? (
          <div>
            <h2>Role Options</h2>
          </div>
        ) : (
          <MatchesFilterBar />
        )}
      </div>
      <div className="flex-1">
        {accountType === 'individual' ? (
          <CompanyMatchList />
        ) : (
          <TalentMatchList />
        )}
      </div>
    </div>
  );
};
