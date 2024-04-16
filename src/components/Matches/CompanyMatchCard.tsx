/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

// TODO: broaden support for matches context to support profiles OR roles
// Then, we can type "role" as a Role here
export const CompanyMatchCard = ({ role }: any) => {
  return (
    <div>
      <p>CompanyMatchCard: {role.role_id}</p>
    </div>
  );
};
