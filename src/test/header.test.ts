import fs from 'fs';
import path from 'path';

const headerSource = fs.readFileSync(
  path.resolve(__dirname, '../components/layout/Header.tsx'),
  'utf8'
);

describe('DEV-382: artist unread-interest badge on the Header', () => {
  it('imports getUnreadThreadCount', () => {
    expect(headerSource).toMatch(/import\s*{\s*getUnreadThreadCount\s*}/);
    expect(headerSource).toMatch(/services\/messages\/client/);
    expect(headerSource).not.toMatch(/Messages\/api/);
    expect(headerSource).not.toMatch(/FirebaseContext|useFirebaseContext/);
  });

  it('only renders the badge when unreadCount is greater than 0', () => {
    expect(headerSource).toMatch(/unreadCount > 0 &&/);
  });

  it('scopes the unread query to individual (artist) accounts only', () => {
    expect(headerSource).toMatch(/accountType !== 'individual'/);
  });

  it('does not gate the unread query on company accounts', () => {
    expect(headerSource).not.toMatch(/accountType === 'company'/);
  });

  it('reads account and profile IDs from user state', () => {
    expect(headerSource).toMatch(/accountId = account\?\.id/);
    expect(headerSource).toMatch(/profileId/);
  });
});
