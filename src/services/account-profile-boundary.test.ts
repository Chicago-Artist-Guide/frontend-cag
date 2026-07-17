import fs from 'fs';
import path from 'path';

const userContextConsumers = [
  '../components/layout/Header.tsx',
  '../context/MatchContext.tsx',
  '../context/MessageContext.tsx',
  '../components/Messages/MessageThread.tsx',
  '../components/Messages/MessageThreads.tsx',
  '../components/Matches/CompanyMatchCard.tsx',
  '../components/Matches/CompanyMatchList.tsx',
  '../components/Matches/TalentMatchCard.tsx',
  '../components/Matches/TalentMatchList.tsx',
  '../components/Matches/TalentMatchesFilterBar.tsx',
  '../components/Staff/Analytics/DebugAuth.tsx'
];

const accountProfileReadConsumers = [
  '../routes/Profile.tsx',
  '../routes/PublicShowDetail.tsx',
  '../components/Messages/MessageThread.tsx',
  '../components/Messages/MessageThreads.tsx',
  '../components/Matches/CompanyMatchCard.tsx',
  '../components/Matches/TalentMatchCard.tsx',
  '../components/Matches/TalentMatchList.tsx',
  '../components/Matches/declineNotifications.ts',
  '../components/PublicShows/PublicShowCard.tsx'
];

const forbiddenUserContextReferences = [
  /account\s*(?:\?\.)?\.ref/,
  /account\s*\?\.ref/,
  /profile\s*(?:\?\.)?\.ref/,
  /profile\s*\?\.ref/,
  /setAccountRef/,
  /setProfileRef/
];

describe('account and profile consumer boundary', () => {
  it.each(userContextConsumers)(
    '%s reads document IDs instead of references',
    (file) => {
      const source = fs.readFileSync(path.resolve(__dirname, file), 'utf8');

      forbiddenUserContextReferences.forEach((pattern) => {
        expect(source).not.toMatch(pattern);
      });
    }
  );

  it.each(accountProfileReadConsumers)(
    '%s does not import the retired profile shared API',
    (file) => {
      const source = fs.readFileSync(path.resolve(__dirname, file), 'utf8');

      expect(source).not.toMatch(/Profile\/shared\/api/);
    }
  );
});
