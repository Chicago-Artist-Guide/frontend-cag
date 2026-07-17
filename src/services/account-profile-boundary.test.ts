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

const parseSource = (source: string, file: string) =>
  ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

interface ModuleImports {
  named: Map<string, string>;
  namespaces: Set<string>;
}

const getModuleImports = (
  sourceFile: ts.SourceFile,
  moduleNames: Set<string>
): ModuleImports => {
  const named = new Map<string, string>();
  const namespaces = new Set<string>();

  sourceFile.statements.forEach((statement) => {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !moduleNames.has(statement.moduleSpecifier.text)
    ) {
      return;
    }

    const bindings = statement.importClause?.namedBindings;

    if (bindings && ts.isNamedImports(bindings)) {
      bindings.elements.forEach((element) => {
        named.set(
          element.name.text,
          element.propertyName?.text ?? element.name.text
        );
      });
    } else if (bindings && ts.isNamespaceImport(bindings)) {
      namespaces.add(bindings.name.text);
    }
  });

  return { named, namespaces };
};

const collectConstInitializers = (sourceFile: ts.SourceFile) => {
  const initializers = new Map<string, ts.Expression>();

  sourceFile.statements.forEach((statement) => {
    if (
      !ts.isVariableStatement(statement) ||
      !(statement.declarationList.flags & ts.NodeFlags.Const)
    ) {
      return;
    }

    statement.declarationList.declarations.forEach((declaration) => {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        initializers.set(declaration.name.text, declaration.initializer);
      }
    });
  });

  return initializers;
};

const unwrapExpression = (expression: ts.Expression): ts.Expression => {
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isTypeAssertionExpression(expression) ||
    ts.isSatisfiesExpression(expression)
  ) {
    return unwrapExpression(expression.expression);
  }

  return expression;
};

const getObjectPropertyInitializer = (
  expression: ts.Expression,
  propertyName: string,
  constInitializers: Map<string, ts.Expression>,
  visited: Set<string>
): ts.Expression | undefined => {
  const unwrapped = unwrapExpression(expression);

  if (ts.isIdentifier(unwrapped)) {
    if (visited.has(unwrapped.text)) return undefined;

    const initializer = constInitializers.get(unwrapped.text);
    if (!initializer) return undefined;

    const nextVisited = new Set(visited);
    nextVisited.add(unwrapped.text);
    return getObjectPropertyInitializer(
      initializer,
      propertyName,
      constInitializers,
      nextVisited
    );
  }

  if (!ts.isObjectLiteralExpression(unwrapped)) return undefined;

  for (const property of unwrapped.properties) {
    if (!ts.isPropertyAssignment(property)) continue;

    const name = property.name;
    const resolvedName =
      ts.isIdentifier(name) ||
      ts.isStringLiteral(name) ||
      ts.isNumericLiteral(name)
        ? name.text
        : undefined;

    if (resolvedName === propertyName) return property.initializer;
  }

  return undefined;
};

const resolveStaticString = (
  expression: ts.Expression,
  constInitializers: Map<string, ts.Expression>,
  visited = new Set<string>()
): string | undefined => {
  const unwrapped = unwrapExpression(expression);

  if (
    ts.isStringLiteral(unwrapped) ||
    ts.isNoSubstitutionTemplateLiteral(unwrapped)
  ) {
    return unwrapped.text;
  }

  if (ts.isIdentifier(unwrapped)) {
    if (visited.has(unwrapped.text)) return undefined;

    const initializer = constInitializers.get(unwrapped.text);
    if (!initializer) return undefined;

    const nextVisited = new Set(visited);
    nextVisited.add(unwrapped.text);
    return resolveStaticString(initializer, constInitializers, nextVisited);
  }

  if (ts.isTemplateExpression(unwrapped)) {
    let value = unwrapped.head.text;

    for (const span of unwrapped.templateSpans) {
      const expressionValue = resolveStaticString(
        span.expression,
        constInitializers,
        new Set(visited)
      );
      if (expressionValue === undefined) return undefined;
      value += expressionValue + span.literal.text;
    }

    return value;
  }

  if (
    ts.isBinaryExpression(unwrapped) &&
    unwrapped.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    const left = resolveStaticString(
      unwrapped.left,
      constInitializers,
      new Set(visited)
    );
    const right = resolveStaticString(
      unwrapped.right,
      constInitializers,
      new Set(visited)
    );

    return left === undefined || right === undefined ? undefined : left + right;
  }

  if (
    ts.isPropertyAccessExpression(unwrapped) ||
    ts.isElementAccessExpression(unwrapped)
  ) {
    const propertyName = ts.isPropertyAccessExpression(unwrapped)
      ? unwrapped.name.text
      : unwrapped.argumentExpression
        ? resolveStaticString(
            unwrapped.argumentExpression,
            constInitializers,
            new Set(visited)
          )
        : undefined;
    if (propertyName === undefined) return undefined;

    const initializer = getObjectPropertyInitializer(
      unwrapped.expression,
      propertyName,
      constInitializers,
      new Set(visited)
    );

    return initializer
      ? resolveStaticString(initializer, constInitializers, new Set(visited))
      : undefined;
  }

  return undefined;
};

const isImportedCall = (
  expression: ts.LeftHandSideExpression,
  imports: ModuleImports,
  importedName?: string
) => {
  if (ts.isIdentifier(expression)) {
    const originalName = imports.named.get(expression.text);
    return (
      originalName !== undefined &&
      (importedName === undefined || originalName === importedName)
    );
  }

  return (
    ts.isPropertyAccessExpression(expression) &&
    ts.isIdentifier(expression.expression) &&
    imports.namespaces.has(expression.expression.text) &&
    (importedName === undefined || expression.name.text === importedName)
  );
};

const analyzeAccountProfileFirestoreSource = (source: string, file: string) => {
  const sourceFile = parseSource(source, file);
  const imports = getModuleImports(
    sourceFile,
    new Set(['@firebase/firestore', 'firebase/firestore'])
  );
  const constInitializers = collectConstInitializers(sourceFile);
  let hasAccess = false;

  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      isImportedCall(node.expression, imports) &&
      node.arguments.some((argument) => {
        const value = resolveStaticString(argument, constInitializers);
        return (
          value === 'accounts' ||
          value === 'profiles' ||
          value?.startsWith('accounts/') ||
          value?.startsWith('profiles/')
        );
      })
    ) {
      hasAccess = true;
      return;
    }

    if (!hasAccess) ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return hasAccess;
};

const hasAccountProfileFirestoreAccess = (file: string) =>
  analyzeAccountProfileFirestoreSource(readProjectFile(file), file);

const findUnexpectedAccountProfileFirestoreFiles = (files: string[]) =>
  files
    .filter(
      (file) =>
        !legacyAccountProfileFirestoreFiles.has(file) &&
        !accountProfileAdapters.has(file)
    )
    .sort();

const hasModifier = (node: ts.Node, kind: ts.SyntaxKind) =>
  ts.canHaveModifiers(node) &&
  ts.getModifiers(node)?.some((modifier) => modifier.kind === kind);

const getExportedFirebaseParameterViolations = (
  source: string,
  file: string
) => {
  const sourceFile = parseSource(source, file);
  const firestoreImports = getModuleImports(
    sourceFile,
    new Set(['@firebase/firestore', 'firebase/firestore'])
  );
  const firebaseTypeNames = new Set(firestoreImports.named.keys());
  const typeAliases = sourceFile.statements.filter(ts.isTypeAliasDeclaration);

  const typeContainsFirebase = (node: ts.Node): boolean => {
    if (ts.isIdentifier(node) && firebaseTypeNames.has(node.text)) return true;

    if (
      ts.isQualifiedName(node) &&
      ts.isIdentifier(node.left) &&
      firestoreImports.namespaces.has(node.left.text)
    ) {
      return true;
    }

    let containsFirebase = false;
    ts.forEachChild(node, (child) => {
      if (!containsFirebase && typeContainsFirebase(child)) {
        containsFirebase = true;
      }
    });
    return containsFirebase;
  };

  let changed = true;
  while (changed) {
    changed = false;
    typeAliases.forEach((alias) => {
      if (
        !firebaseTypeNames.has(alias.name.text) &&
        typeContainsFirebase(alias.type)
      ) {
        firebaseTypeNames.add(alias.name.text);
        changed = true;
      }
    });
  }

  const functions = new Map<
    string,
    ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression
  >();
  const exportedNames = new Set<string>();

  sourceFile.statements.forEach((statement) => {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      functions.set(statement.name.text, statement);
      if (hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
        exportedNames.add(statement.name.text);
      }
      return;
    }

    if (ts.isVariableStatement(statement)) {
      statement.declarationList.declarations.forEach((declaration) => {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.initializer &&
          (ts.isArrowFunction(declaration.initializer) ||
            ts.isFunctionExpression(declaration.initializer))
        ) {
          functions.set(declaration.name.text, declaration.initializer);
          if (hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
            exportedNames.add(declaration.name.text);
          }
        }
      });
      return;
    }

    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause) &&
      !statement.moduleSpecifier
    ) {
      statement.exportClause.elements.forEach((element) => {
        exportedNames.add(element.propertyName?.text ?? element.name.text);
      });
    }
  });

  return [...functions.entries()].flatMap(([name, fn]) => {
    if (!exportedNames.has(name)) return [];

    return fn.parameters.flatMap((parameter) =>
      parameter.type && typeContainsFirebase(parameter.type)
        ? [`${name}: ${parameter.name.getText(sourceFile)}`]
        : []
    );
  });
};

const getInitializeAppCalls = (source: string, file: string) => {
  const sourceFile = parseSource(source, file);
  const appImports = getModuleImports(sourceFile, new Set(['firebase/app']));
  const calls: ts.CallExpression[] = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      isImportedCall(node.expression, appImports, 'initializeApp')
    ) {
      calls.push(node);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return calls;
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
  it('detects direct, aliased, template, and computed account/profile Firestore calls without matching UI text', () => {
    const fixtures = [
      {
        file: 'src/routes/Direct.ts',
        source:
          "import { collection } from 'firebase/firestore'; collection(db, 'accounts');"
      },
      {
        file: 'src/routes/Aliased.ts',
        source:
          "import { collection as fsCollection } from 'firebase/firestore'; fsCollection(db, 'profiles');"
      },
      {
        file: 'src/routes/Template.ts',
        source:
          "import { collection } from 'firebase/firestore'; const domain = 'account'; collection(db, `${domain}s`);"
      },
      {
        file: 'src/routes/Computed.ts',
        source:
          "import { doc } from 'firebase/firestore'; const names = { profile: 'profiles' }; const key = 'profile'; doc(db, names[key], id);"
      }
    ];
    const unrelatedUi =
      "import { getDoc } from 'firebase/firestore'; export const Copy = () => <p>Browse profiles and accounts</p>;";

    fixtures.forEach(({ file, source }) => {
      expect(analyzeAccountProfileFirestoreSource(source, file)).toBe(true);
    });
    expect(
      analyzeAccountProfileFirestoreSource(
        unrelatedUi,
        'src/routes/Unrelated.tsx'
      )
    ).toBe(false);
    expect(
      findUnexpectedAccountProfileFirestoreFiles(
        fixtures
          .filter(({ file, source }) =>
            analyzeAccountProfileFirestoreSource(source, file)
          )
          .map(({ file }) => file)
      )
    ).toEqual(fixtures.map(({ file }) => file).sort());
  });

  it('detects Firebase parameters on every exported function form through import and type aliases', () => {
    const source = `
      import type { Firestore as Database } from 'firebase/firestore';
      type DatabaseAlias = Database;
      export function direct(db: Database): void {}
      export const aliased = (db: DatabaseAlias) => db;
      export default function defaultExport(db: DatabaseAlias): DatabaseAlias { return db; }
    `;

    expect(
      getExportedFirebaseParameterViolations(source, 'src/services/example.ts')
    ).toEqual(['direct: db', 'aliased: db', 'defaultExport: db']);
  });

  it('detects initializeApp calls made through an import alias', () => {
    const source = `
      import { initializeApp as init } from 'firebase/app';
      init(config);
    `;

    expect(getInitializeAppCalls(source, 'src/lib/other.ts')).toHaveLength(1);
  });

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

      expect(source).toMatch(/^import 'client-only';/);
      expect(getExportedFirebaseParameterViolations(source, file)).toEqual([]);
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
      .filter(
        (file) => getInitializeAppCalls(readProjectFile(file), file).length > 0
      )
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
    expect(
      getInitializeAppCalls(singletonSource, firebaseSingleton)
    ).toHaveLength(1);
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
      expect(getInitializeAppCalls(source, file)).toHaveLength(1);
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
