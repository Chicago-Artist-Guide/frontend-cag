import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const legacyAccountProfileFirestoreFiles = new Set([
  'src/components/Admin/Companies/CompanyCreateModal.tsx',
  'src/components/Admin/Companies/CompanyEditModal.tsx',
  'src/components/Admin/Companies/TheatreRequestModal.tsx',
  'src/components/Admin/Users/UserEditModal.tsx',
  'src/components/Matches/api.ts',
  'src/components/Messages/api.ts',
  'src/context/AdminContext.tsx',
  'src/context/MessageContext.tsx',
  'src/hooks/useAnalyticsData.ts',
  'src/hooks/useCompanies.ts',
  'src/hooks/useSimpleAnalytics.ts',
  'src/hooks/useUsers.ts'
]);

const accountProfileAdapters = new Set([
  'src/services/accounts/client.ts',
  'src/services/profiles/client.ts'
]);

const projectRoot = path.resolve(__dirname, '../..');
const firebaseSingleton = 'src/lib/firebase/client.ts';
const namedSecondaryAppFiles = [
  'src/components/Admin/Companies/CompanyCreateModal.tsx',
  'src/components/Admin/Companies/TheatreRequestModal.tsx'
];

const readProjectFile = (file: string) =>
  fs.readFileSync(path.resolve(projectRoot, file), 'utf8');

const listProductionSourceFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.resolve(directory, entry.name);

    if (entry.isDirectory()) return listProductionSourceFiles(absolutePath);
    if (
      !/\.(?:ts|tsx)$/.test(entry.name) ||
      /\.test\.[^.]+$/.test(entry.name)
    ) {
      return [];
    }

    return [path.relative(projectRoot, absolutePath).split(path.sep).join('/')];
  });

const productionSourceFiles = listProductionSourceFiles(
  path.resolve(projectRoot, 'src')
);

const hasAccountProfileFirestoreAccess = (file: string) => {
  const source = readProjectFile(file);

  return (
    /from\s+['"](?:@firebase\/firestore|firebase\/firestore)['"]/.test(
      source
    ) && /['"](?:accounts|profiles)(?:\/[^'"]*)?['"]/.test(source)
  );
};

const findUnexpectedAccountProfileFirestoreFiles = (files: string[]) =>
  files
    .filter(
      (file) =>
        !legacyAccountProfileFirestoreFiles.has(file) &&
        !accountProfileAdapters.has(file)
    )
    .sort();

const getExportedFunctionParameters = (source: string, file: string) => {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  return sourceFile.statements.flatMap((statement) => {
    if (
      !ts.isVariableStatement(statement) ||
      !statement.modifiers?.some(
        ({ kind }) => kind === ts.SyntaxKind.ExportKeyword
      )
    ) {
      return [];
    }

    return statement.declarationList.declarations.flatMap((declaration) => {
      const initializer = declaration.initializer;

      if (
        !initializer ||
        (!ts.isArrowFunction(initializer) &&
          !ts.isFunctionExpression(initializer))
      ) {
        return [];
      }

      return initializer.parameters.map((parameter) =>
        parameter.getText(sourceFile)
      );
    });
  });
};

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
  it('rejects a new account/profile Firestore consumer outside the boundary', () => {
    expect(
      findUnexpectedAccountProfileFirestoreFiles([
        ...legacyAccountProfileFirestoreFiles,
        ...accountProfileAdapters,
        'src/routes/NewAccountRoute.tsx'
      ])
    ).toEqual(['src/routes/NewAccountRoute.tsx']);
  });

  it('allows only adapters and the explicit legacy files to access account/profile Firestore collections', () => {
    const accountProfileFirestoreFiles = productionSourceFiles.filter(
      hasAccountProfileFirestoreAccess
    );

    expect(
      findUnexpectedAccountProfileFirestoreFiles(accountProfileFirestoreFiles)
    ).toEqual([]);
    expect(accountProfileFirestoreFiles).toEqual(
      expect.arrayContaining([...accountProfileAdapters])
    );
  });

  it.each([...accountProfileAdapters])(
    '%s is browser-only and has no public Firebase parameters',
    (file) => {
      const source = readProjectFile(file);
      const exportedParameters = getExportedFunctionParameters(source, file);

      expect(source).toMatch(/^import 'client-only';/);
      expect(exportedParameters.length).toBeGreaterThan(0);
      exportedParameters.forEach((parameter) => {
        expect(parameter).not.toMatch(
          /\b(?:Firestore|CollectionReference|DocumentReference|DocumentSnapshot|Query)\b/
        );
      });
    }
  );

  it('keeps Firebase document references out of UserContext', () => {
    const source = readProjectFile('src/context/UserContext.tsx');

    expect(source).not.toMatch(/DocumentReference/);
    expect(source).not.toMatch(/@firebase\/firestore|firebase\/firestore/);
  });

  it('keeps the retired shared profile API deleted', () => {
    expect(
      fs.existsSync(
        path.resolve(projectRoot, 'src/components/Profile/shared/api.ts')
      )
    ).toBe(false);
  });

  it('initializes the default Firebase app only in the client singleton', () => {
    const initializationFiles = productionSourceFiles
      .filter((file) => /\binitializeApp\s*\(/.test(readProjectFile(file)))
      .sort();
    const expectedFiles = [firebaseSingleton, ...namedSecondaryAppFiles].sort();
    const singletonSource = readProjectFile(firebaseSingleton);

    expect(initializationFiles).toEqual(expectedFiles);
    expect(singletonSource).toMatch(
      /initializeApp\(\s*firebaseClientConfig\s*\)/
    );
    expect(singletonSource).toMatch(
      /getApps\(\)\.some\(\(\{ name \}\) => name === '\[DEFAULT\]'\)/
    );
    expect(singletonSource.match(/\binitializeApp\s*\(/g)).toHaveLength(1);
  });

  it.each(namedSecondaryAppFiles)(
    '%s uses a named secondary auth app and preserves the administrator session',
    (file) => {
      const source = readProjectFile(file);

      expect(source).toMatch(
        /initializeApp\(\s*firebaseClientConfig,\s*`SecondaryApp_\$\{Date\.now\(\)\}`\s*\)/
      );
      expect(source).toMatch(/const secondaryAuth = getAuth\(secondaryApp\)/);
      expect(source).toMatch(
        /createUserWithEmailAndPassword\(\s*secondaryAuth,/
      );
      expect(source).toMatch(/deleteApp\(secondaryApp\)/);
      expect(source.match(/\binitializeApp\s*\(/g)).toHaveLength(1);
    }
  );

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
