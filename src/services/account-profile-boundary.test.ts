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

interface StaticBindings {
  declarations: Map<string, ts.VariableDeclaration[]>;
  lexicalDeclarations: Map<string, ts.Declaration[]>;
  sourceFile: ts.SourceFile;
  typeAliases: Map<string, ts.TypeAliasDeclaration>;
}

const collectStaticBindings = (sourceFile: ts.SourceFile): StaticBindings => {
  const declarations = new Map<string, ts.VariableDeclaration[]>();
  const lexicalDeclarations = new Map<string, ts.Declaration[]>();
  const typeAliases = new Map<string, ts.TypeAliasDeclaration>();

  const addLexicalDeclaration = (name: string, declaration: ts.Declaration) => {
    const namedDeclarations = lexicalDeclarations.get(name) ?? [];
    namedDeclarations.push(declaration);
    lexicalDeclarations.set(name, namedDeclarations);
  };

  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      addLexicalDeclaration(node.name.text, node);

      if (
        node.initializer &&
        ts.isVariableDeclarationList(node.parent) &&
        Boolean(node.parent.flags & ts.NodeFlags.Const)
      ) {
        const namedDeclarations = declarations.get(node.name.text) ?? [];
        namedDeclarations.push(node);
        declarations.set(node.name.text, namedDeclarations);
      }
    } else if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
      addLexicalDeclaration(node.name.text, node);
    } else if (ts.isFunctionDeclaration(node) && node.name) {
      addLexicalDeclaration(node.name.text, node);
    } else if (ts.isTypeAliasDeclaration(node)) {
      typeAliases.set(node.name.text, node);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return { declarations, lexicalDeclarations, sourceFile, typeAliases };
};

const isWithinNode = (node: ts.Node, ancestor: ts.Node) => {
  let current: ts.Node | undefined = node;

  while (current) {
    if (current === ancestor) return true;
    current = current.parent;
  }

  return false;
};

const getLexicalScope = (declaration: ts.VariableDeclaration) => {
  let current: ts.Node | undefined = declaration.parent;

  while (current) {
    if (
      ts.isSourceFile(current) ||
      ts.isBlock(current) ||
      ts.isCaseBlock(current) ||
      ts.isForStatement(current) ||
      ts.isForInStatement(current) ||
      ts.isForOfStatement(current)
    ) {
      return current;
    }
    current = current.parent;
  }

  return undefined;
};

const getBindingScope = (declaration: ts.Declaration): ts.Node | undefined => {
  if (ts.isParameter(declaration)) {
    return declaration.parent;
  }

  if (ts.isFunctionDeclaration(declaration)) {
    let current: ts.Node | undefined = declaration.parent;

    while (current) {
      if (ts.isSourceFile(current) || ts.isBlock(current)) return current;
      current = current.parent;
    }
    return undefined;
  }

  if (ts.isVariableDeclaration(declaration)) {
    if (ts.isCatchClause(declaration.parent)) {
      return declaration.parent.block;
    }

    if (
      ts.isVariableDeclarationList(declaration.parent) &&
      !(declaration.parent.flags & ts.NodeFlags.BlockScoped)
    ) {
      let current: ts.Node | undefined = declaration.parent;

      while (current) {
        if (ts.isFunctionLike(current)) return current;
        if (ts.isSourceFile(current)) return current;
        current = current.parent;
      }
      return undefined;
    }

    return getLexicalScope(declaration);
  }

  return undefined;
};

const findVisibleLexicalBinding = (
  identifier: ts.Identifier,
  bindings: StaticBindings
) =>
  (bindings.lexicalDeclarations.get(identifier.text) ?? [])
    .map((declaration) => ({
      declaration,
      scope: getBindingScope(declaration)
    }))
    .filter(
      (
        candidate
      ): candidate is { declaration: ts.Declaration; scope: ts.Node } =>
        Boolean(candidate.scope && isWithinNode(identifier, candidate.scope))
    )
    .sort((left, right) => {
      const widthDifference =
        left.scope.getWidth(bindings.sourceFile) -
        right.scope.getWidth(bindings.sourceFile);

      return widthDifference === 0
        ? right.declaration.getStart(bindings.sourceFile) -
            left.declaration.getStart(bindings.sourceFile)
        : widthDifference;
    })[0]?.declaration;

const findVisibleConstDeclaration = (
  identifier: ts.Identifier,
  bindings: StaticBindings
) =>
  (bindings.declarations.get(identifier.text) ?? [])
    .filter((declaration) => {
      const scope = getLexicalScope(declaration);

      return (
        declaration.getStart(bindings.sourceFile) <
          identifier.getStart(bindings.sourceFile) &&
        Boolean(scope && isWithinNode(identifier, scope))
      );
    })
    .sort(
      (left, right) =>
        right.getStart(bindings.sourceFile) - left.getStart(bindings.sourceFile)
    )[0];

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
  bindings: StaticBindings,
  visited: Set<ts.VariableDeclaration>
): ts.Expression | undefined => {
  const unwrapped = unwrapExpression(expression);

  if (ts.isIdentifier(unwrapped)) {
    const declaration = findVisibleConstDeclaration(unwrapped, bindings);
    if (!declaration?.initializer || visited.has(declaration)) return undefined;

    const nextVisited = new Set(visited);
    nextVisited.add(declaration);
    return getObjectPropertyInitializer(
      declaration.initializer,
      propertyName,
      bindings,
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
  bindings: StaticBindings,
  visited = new Set<ts.VariableDeclaration>()
): string | undefined => {
  const unwrapped = unwrapExpression(expression);

  if (
    ts.isStringLiteral(unwrapped) ||
    ts.isNoSubstitutionTemplateLiteral(unwrapped)
  ) {
    return unwrapped.text;
  }

  if (ts.isIdentifier(unwrapped)) {
    const declaration = findVisibleConstDeclaration(unwrapped, bindings);
    if (!declaration?.initializer || visited.has(declaration)) return undefined;

    const nextVisited = new Set(visited);
    nextVisited.add(declaration);
    return resolveStaticString(declaration.initializer, bindings, nextVisited);
  }

  if (ts.isTemplateExpression(unwrapped)) {
    let value = unwrapped.head.text;

    for (const span of unwrapped.templateSpans) {
      const expressionValue = resolveStaticString(
        span.expression,
        bindings,
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
      bindings,
      new Set(visited)
    );
    const right = resolveStaticString(
      unwrapped.right,
      bindings,
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
            bindings,
            new Set(visited)
          )
        : undefined;
    if (propertyName === undefined) return undefined;

    const initializer = getObjectPropertyInitializer(
      unwrapped.expression,
      propertyName,
      bindings,
      new Set(visited)
    );

    return initializer
      ? resolveStaticString(initializer, bindings, new Set(visited))
      : undefined;
  }

  return undefined;
};

const getImportedCallName = (
  expression: ts.Expression,
  imports: ModuleImports,
  bindings?: StaticBindings,
  visited = new Set<ts.VariableDeclaration>()
) => {
  const unwrapped = unwrapExpression(expression);

  if (ts.isIdentifier(unwrapped)) {
    const declaration = bindings
      ? findVisibleLexicalBinding(unwrapped, bindings)
      : undefined;

    if (declaration && ts.isVariableDeclaration(declaration)) {
      if (!declaration.initializer) return undefined;
      if (visited.has(declaration)) return undefined;

      const nextVisited = new Set(visited);
      nextVisited.add(declaration);
      return getImportedCallName(
        declaration.initializer,
        imports,
        bindings,
        nextVisited
      );
    }

    if (declaration) return undefined;

    return imports.named.get(unwrapped.text);
  }

  if (
    ts.isPropertyAccessExpression(unwrapped) &&
    ts.isIdentifier(unwrapped.expression) &&
    (!bindings || !findVisibleLexicalBinding(unwrapped.expression, bindings)) &&
    imports.namespaces.has(unwrapped.expression.text)
  ) {
    return unwrapped.name.text;
  }

  return undefined;
};

const isImportedCall = (
  expression: ts.LeftHandSideExpression,
  imports: ModuleImports,
  importedName?: string,
  bindings?: StaticBindings
) => {
  const callName = getImportedCallName(expression, imports, bindings);

  return (
    callName !== undefined &&
    (importedName === undefined || callName === importedName)
  );
};

const firestorePathConstructors = new Set([
  'collection',
  'collectionGroup',
  'doc'
]);

const isAccountProfileCollection = (value: string | undefined) =>
  value === 'accounts' || value === 'profiles';

const getModuleReExports = (
  sourceFile: ts.SourceFile,
  moduleNames: Set<string>
) =>
  sourceFile.statements.flatMap((statement) => {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !moduleNames.has(statement.moduleSpecifier.text)
    ) {
      return [];
    }

    if (!statement.exportClause) return [{ importedName: '*', statement }];
    if (!ts.isNamedExports(statement.exportClause)) return [];

    return statement.exportClause.elements.map((element) => ({
      importedName: element.propertyName?.text ?? element.name.text,
      statement
    }));
  });

const getExportedLocalNames = (sourceFile: ts.SourceFile) => {
  const exportedNames = new Set<string>();

  sourceFile.statements.forEach((statement) => {
    if (
      ts.isVariableStatement(statement) &&
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      )
    ) {
      statement.declarationList.declarations.forEach((declaration) => {
        if (ts.isIdentifier(declaration.name)) {
          exportedNames.add(declaration.name.text);
        }
      });
    } else if (
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      )
    ) {
      exportedNames.add(statement.name.text);
    } else if (
      ts.isExportDeclaration(statement) &&
      !statement.moduleSpecifier &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      statement.exportClause.elements.forEach((element) => {
        exportedNames.add(element.propertyName?.text ?? element.name.text);
      });
    } else if (
      ts.isExportAssignment(statement) &&
      ts.isIdentifier(unwrapExpression(statement.expression))
    ) {
      exportedNames.add(
        (unwrapExpression(statement.expression) as ts.Identifier).text
      );
    }
  });

  return exportedNames;
};

const isInsideFunction = (node: ts.Node, sourceFile: ts.SourceFile) => {
  let current: ts.Node | undefined = node.parent;

  while (current && current !== sourceFile) {
    if (ts.isFunctionLike(current)) return true;

    current = current.parent;
  }

  return false;
};

type ReferencePathParity = 0 | 1 | undefined;

const getTypeReferenceParity = (
  type: ts.TypeNode | undefined,
  imports: ModuleImports,
  bindings: StaticBindings,
  visited = new Set<string>()
): ReferencePathParity => {
  if (!type) return undefined;

  if (ts.isParenthesizedTypeNode(type)) {
    return getTypeReferenceParity(type.type, imports, bindings, visited);
  }

  if (ts.isUnionTypeNode(type)) {
    const parities = type.types.map((member) =>
      getTypeReferenceParity(member, imports, bindings, new Set(visited))
    );

    return parities.every((parity) => parity === parities[0])
      ? parities[0]
      : undefined;
  }

  if (!ts.isTypeReferenceNode(type)) return undefined;

  if (ts.isIdentifier(type.typeName)) {
    const localName = type.typeName.text;
    const importedName = imports.named.get(localName);

    if (importedName !== undefined) {
      if (importedName === 'CollectionReference') return 1;
      if (
        importedName === 'DocumentReference' ||
        importedName === 'Firestore'
      ) {
        return 0;
      }

      return undefined;
    }

    const alias = bindings.typeAliases.get(localName);
    if (!alias || visited.has(localName)) return undefined;

    const nextVisited = new Set(visited);
    nextVisited.add(localName);
    return getTypeReferenceParity(alias.type, imports, bindings, nextVisited);
  }

  if (
    ts.isQualifiedName(type.typeName) &&
    ts.isIdentifier(type.typeName.left) &&
    imports.namespaces.has(type.typeName.left.text)
  ) {
    if (type.typeName.right.text === 'CollectionReference') return 1;
    if (
      type.typeName.right.text === 'DocumentReference' ||
      type.typeName.right.text === 'Firestore'
    ) {
      return 0;
    }
  }

  return undefined;
};

const getReferencePathParity = (
  expression: ts.Expression | undefined,
  imports: ModuleImports,
  bindings: StaticBindings,
  visited = new Set<ts.Declaration>()
): ReferencePathParity => {
  if (!expression) return undefined;

  const unwrapped = unwrapExpression(expression);

  if (ts.isIdentifier(unwrapped)) {
    const declaration = findVisibleLexicalBinding(unwrapped, bindings);

    if (declaration) {
      const typedParity =
        ts.isVariableDeclaration(declaration) || ts.isParameter(declaration)
          ? getTypeReferenceParity(declaration.type, imports, bindings)
          : undefined;
      if (typedParity !== undefined) return typedParity;

      if (
        ts.isVariableDeclaration(declaration) &&
        declaration.initializer &&
        !visited.has(declaration)
      ) {
        const nextVisited = new Set(visited);
        nextVisited.add(declaration);
        return getReferencePathParity(
          declaration.initializer,
          imports,
          bindings,
          nextVisited
        );
      }

      return undefined;
    }

    return undefined;
  }

  if (ts.isCallExpression(unwrapped)) {
    const callName = getImportedCallName(
      unwrapped.expression,
      imports,
      bindings
    );

    if (callName === 'collection' || callName === 'collectionGroup') return 1;
    if (callName === 'doc') return 0;

    return undefined;
  }

  return undefined;
};

interface CollectionSegmentAnalysis {
  accountProfile: boolean;
  dynamicCollection: boolean;
}

const analyzeCollectionSegments = (
  call: ts.CallExpression,
  callName: string,
  imports: ModuleImports,
  bindings: StaticBindings
): CollectionSegmentAnalysis => {
  if (callName === 'collectionGroup') {
    const collectionName = call.arguments[1]
      ? resolveStaticString(call.arguments[1], bindings)
      : undefined;

    return {
      accountProfile: isAccountProfileCollection(collectionName),
      dynamicCollection: collectionName === undefined
    };
  }

  let parity = getReferencePathParity(call.arguments[0], imports, bindings);
  let dynamicCollection = false;
  const pathSegmentCount = call.arguments.slice(1).reduce((count, argument) => {
    const value = resolveStaticString(argument, bindings);
    return count + (value === undefined ? 1 : value.split('/').length);
  }, 0);

  if (parity === undefined) {
    parity =
      callName === 'doc'
        ? ((pathSegmentCount % 2) as 0 | 1)
        : (((pathSegmentCount + 1) % 2) as 0 | 1);
  }

  for (const argument of call.arguments.slice(1)) {
    const value = resolveStaticString(argument, bindings);
    const segments = value === undefined ? [undefined] : value.split('/');

    for (const segment of segments) {
      if (parity === 0) {
        if (isAccountProfileCollection(segment)) {
          return { accountProfile: true, dynamicCollection };
        }
        if (segment === undefined) dynamicCollection = true;
      }
      parity = parity === 0 ? 1 : 0;
    }
  }

  return { accountProfile: false, dynamicCollection };
};

const analyzeAccountProfileFirestoreSource = (source: string, file: string) => {
  const sourceFile = parseSource(source, file);
  const imports = getModuleImports(
    sourceFile,
    new Set(['@firebase/firestore', 'firebase/firestore'])
  );
  const bindings = collectStaticBindings(sourceFile);
  const exportedNames = getExportedLocalNames(sourceFile);
  const reExportsPathConstructor = getModuleReExports(
    sourceFile,
    new Set(['@firebase/firestore', 'firebase/firestore'])
  ).some(
    ({ importedName }) =>
      importedName === '*' || firestorePathConstructors.has(importedName)
  );
  let hasAccess = false;

  if (reExportsPathConstructor) return true;

  for (const [name, declarations] of bindings.declarations) {
    if (!exportedNames.has(name)) continue;

    if (
      declarations.some(
        (declaration) =>
          declaration.initializer &&
          firestorePathConstructors.has(
            getImportedCallName(declaration.initializer, imports, bindings) ??
              ''
          )
      )
    ) {
      return true;
    }
  }

  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const callName = getImportedCallName(node.expression, imports, bindings);

      if (callName && firestorePathConstructors.has(callName)) {
        const analysis = analyzeCollectionSegments(
          node,
          callName,
          imports,
          bindings
        );

        if (
          analysis.accountProfile ||
          (analysis.dynamicCollection && isInsideFunction(node, sourceFile))
        ) {
          hasAccess = true;
          return;
        }
      }
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
  const anonymousDefaultFunctions: (
    | ts.FunctionDeclaration
    | ts.ArrowFunction
    | ts.FunctionExpression
  )[] = [];
  const exportedNames = new Set<string>();

  sourceFile.statements.forEach((statement) => {
    if (ts.isFunctionDeclaration(statement)) {
      if (statement.name) {
        functions.set(statement.name.text, statement);
        if (hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
          exportedNames.add(statement.name.text);
        }
      } else if (
        hasModifier(statement, ts.SyntaxKind.ExportKeyword) &&
        hasModifier(statement, ts.SyntaxKind.DefaultKeyword)
      ) {
        anonymousDefaultFunctions.push(statement);
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

    if (ts.isExportAssignment(statement)) {
      const expression = unwrapExpression(statement.expression);

      if (
        ts.isArrowFunction(expression) ||
        ts.isFunctionExpression(expression)
      ) {
        anonymousDefaultFunctions.push(expression);
      } else if (ts.isIdentifier(expression)) {
        exportedNames.add(expression.text);
      }
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

  const getParameterViolations = (
    name: string,
    fn: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression
  ) =>
    fn.parameters.flatMap((parameter) =>
      parameter.type && typeContainsFirebase(parameter.type)
        ? [`${name}: ${parameter.name.getText(sourceFile)}`]
        : []
    );

  return [
    ...[...functions.entries()].flatMap(([name, fn]) =>
      exportedNames.has(name) ? getParameterViolations(name, fn) : []
    ),
    ...anonymousDefaultFunctions.flatMap((fn) =>
      getParameterViolations('default', fn)
    )
  ];
};

const getInitializeAppCalls = (source: string, file: string) => {
  const sourceFile = parseSource(source, file);
  const appImports = getModuleImports(sourceFile, new Set(['firebase/app']));
  const bindings = collectStaticBindings(sourceFile);
  const exportedNames = getExportedLocalNames(sourceFile);
  const initializationNodes: ts.Node[] = getModuleReExports(
    sourceFile,
    new Set(['firebase/app'])
  )
    .filter(
      ({ importedName }) =>
        importedName === '*' || importedName === 'initializeApp'
    )
    .map(({ statement }) => statement);

  for (const [name, declarations] of bindings.declarations) {
    if (!exportedNames.has(name)) continue;

    declarations.forEach((declaration) => {
      if (
        declaration.initializer &&
        getImportedCallName(declaration.initializer, appImports, bindings) ===
          'initializeApp'
      ) {
        initializationNodes.push(declaration);
      }
    });
  }

  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      isImportedCall(node.expression, appImports, 'initializeApp', bindings)
    ) {
      initializationNodes.push(node);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return initializationNodes;
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

  it('ignores account/profile strings passed to non-path Firestore APIs', () => {
    const source = `
      import { where } from 'firebase/firestore';
      where('kind', '==', 'profiles');
    `;

    expect(
      analyzeAccountProfileFirestoreSource(source, 'src/routes/Filter.ts')
    ).toBe(false);
  });

  it('resolves account/profile collection paths from nested local constants', () => {
    const source = [
      "import { collection } from 'firebase/firestore';",
      'export function load(db: unknown) {',
      "  const domain = 'account';",
      '  if (db) {',
      '    const collectionName = `${domain}s`;',
      '    return collection(db, collectionName);',
      '  }',
      '}'
    ].join('\n');

    expect(
      analyzeAccountProfileFirestoreSource(source, 'src/routes/Nested.ts')
    ).toBe(true);
  });

  it('detects callable aliases, namespace calls, re-exports, and exported wrappers around Firestore path constructors', () => {
    const fixtures = [
      {
        file: 'src/routes/CallableAlias.ts',
        source:
          "import { collection } from 'firebase/firestore'; const getCollection = collection; getCollection(db, 'profiles');"
      },
      {
        file: 'src/routes/NamespaceCall.ts',
        source:
          "import * as firestore from 'firebase/firestore'; firestore.collection(db, 'accounts');"
      },
      {
        file: 'src/routes/ReExport.ts',
        source:
          "export { collection as fsCollection } from 'firebase/firestore';"
      },
      {
        file: 'src/routes/Wrapper.ts',
        source: `
          import { collection } from 'firebase/firestore';
          export const getCollection = (parent: unknown, path: string) =>
            collection(parent as never, path);
        `
      },
      {
        file: 'src/routes/DocumentWrapper.ts',
        source: `
          import { doc } from 'firebase/firestore';
          export const getDocument = (
            parent: unknown,
            collectionPath: string,
            documentId: string
          ) => doc(parent as never, collectionPath, documentId);
        `
      },
      {
        file: 'src/routes/LocalWrapper.ts',
        source: `
          import { collection } from 'firebase/firestore';
          const getCollection = (db: unknown, path: string) =>
            collection(db as never, path);
          getCollection(db, 'accounts');
        `
      }
    ];

    fixtures.forEach(({ file, source }) => {
      expect(analyzeAccountProfileFirestoreSource(source, file)).toBe(true);
    });
    expect(
      findUnexpectedAccountProfileFirestoreFiles(
        fixtures.map(({ file }) => file)
      )
    ).toEqual(fixtures.map(({ file }) => file).sort());
  });

  it('ignores named and namespace Firestore callees shadowed by lexical bindings', () => {
    const fixtures = [
      `
        import { collection } from 'firebase/firestore';
        function run(collection: (...args: unknown[]) => unknown) {
          collection(db, 'accounts');
        }
      `,
      `
        import * as firestore from 'firebase/firestore';
        function run(firestore: { collection: (...args: unknown[]) => unknown }) {
          firestore.collection(db, 'profiles');
        }
      `,
      `
        import { collection } from 'firebase/firestore';
        {
          let collection = (...args: unknown[]) => args;
          collection(db, 'accounts');
        }
      `,
      `
        import { doc } from 'firebase/firestore';
        function run() {
          var doc = (...args: unknown[]) => args;
          doc(db, 'profiles', 'id');
        }
      `,
      `
        import { collection } from 'firebase/firestore';
        function run() {
          function collection(...args: unknown[]) { return args; }
          collection(db, 'accounts');
        }
      `,
      `
        import { doc } from 'firebase/firestore';
        try { throw new Error('expected'); }
        catch (doc) { doc(db, 'profiles', 'id'); }
      `
    ];

    fixtures.forEach((source, index) => {
      expect(
        analyzeAccountProfileFirestoreSource(
          source,
          `src/routes/Shadowed-${index}.ts`
        )
      ).toBe(false);
    });
  });

  it('distinguishes collection segments from document IDs and shadowed constructors', () => {
    const allowed = [
      {
        file: 'src/routes/DocumentId.ts',
        source:
          "import { doc } from 'firebase/firestore'; doc(db, 'settings', 'profiles');"
      },
      {
        file: 'src/routes/ReferenceDocumentId.ts',
        source:
          "import { collection, doc } from 'firebase/firestore'; doc(collection(db, 'settings'), 'profiles');"
      },
      {
        file: 'src/routes/DynamicDocumentId.ts',
        source: `
          import { doc } from 'firebase/firestore';
          export const getSetting = (db: unknown, id: string) =>
            doc(db as never, 'settings', id);
        `
      },
      {
        file: 'src/routes/Shadowed.ts',
        source: `
          import { doc } from 'firebase/firestore';
          {
            const doc = (...args: unknown[]) => args;
            doc(db, 'accounts', 'id');
          }
        `
      }
    ];
    const denied = [
      {
        file: 'src/routes/RootCollection.ts',
        source:
          "import { doc } from 'firebase/firestore'; doc(db, 'accounts', 'id');"
      },
      {
        file: 'src/routes/NestedCollection.ts',
        source:
          "import { doc } from 'firebase/firestore'; doc(db, 'settings', 'id', 'profiles', 'profile-id');"
      },
      {
        file: 'src/routes/DocumentReferenceCollection.ts',
        source:
          "import { collection, doc } from 'firebase/firestore'; collection(doc(db, 'settings', 'id'), 'profiles');"
      },
      {
        file: 'src/routes/CollectionReferenceNestedCollection.ts',
        source:
          "import { collection, doc } from 'firebase/firestore'; doc(collection(db, 'settings'), 'setting-id', 'profiles', 'profile-id');"
      }
    ];

    allowed.forEach(({ file, source }) => {
      expect(analyzeAccountProfileFirestoreSource(source, file)).toBe(false);
    });
    denied.forEach(({ file, source }) => {
      expect(analyzeAccountProfileFirestoreSource(source, file)).toBe(true);
    });
  });

  it('uses reference types to establish path parity without treating unknown references as Firestore roots', () => {
    const collectionReference = `
      import { doc, type CollectionReference } from 'firebase/firestore';
      const settings: CollectionReference = getSettingsCollection();
      doc(settings, 'profiles');
    `;
    const dynamicCollectionDocumentId = `
      import { doc, type CollectionReference } from 'firebase/firestore';
      export const getProfile = (
        settings: CollectionReference,
        id: string
      ) => doc(settings, id);
    `;
    const unknownReference = `
      import { doc } from 'firebase/firestore';
      const reference = getReference();
      doc(reference, 'accounts');
    `;
    const documentReferences = [
      `
        import { collection, type DocumentReference } from 'firebase/firestore';
        const setting: DocumentReference = getSettingDocument();
        collection(setting, 'profiles');
      `,
      `
        import { doc, type DocumentReference } from 'firebase/firestore';
        const setting: DocumentReference = getSettingDocument();
        doc(setting, 'accounts', 'account-id');
      `
    ];

    expect(
      analyzeAccountProfileFirestoreSource(
        collectionReference,
        'src/routes/TypedCollectionReference.ts'
      )
    ).toBe(false);
    expect(
      analyzeAccountProfileFirestoreSource(
        dynamicCollectionDocumentId,
        'src/routes/DynamicCollectionDocumentId.ts'
      )
    ).toBe(false);
    expect(
      analyzeAccountProfileFirestoreSource(
        unknownReference,
        'src/routes/UnknownReference.ts'
      )
    ).toBe(false);
    documentReferences.forEach((source, index) => {
      expect(
        analyzeAccountProfileFirestoreSource(
          source,
          `src/routes/TypedDocumentReference-${index}.ts`
        )
      ).toBe(true);
    });
  });

  it('resolves misleading local reference aliases through their Firebase import', () => {
    const source = `
      import { doc, type DocumentReference as FirebaseDoc } from 'firebase/firestore';
      type CollectionReference = FirebaseDoc;
      const settings: CollectionReference = getSettingDocument();
      doc(settings, 'profiles', 'profile-id');
    `;

    expect(
      analyzeAccountProfileFirestoreSource(
        source,
        'src/routes/AliasedFirebaseDocumentReference.ts'
      )
    ).toBe(true);
  });

  it('does not infer Firebase parity from unrelated local type names', () => {
    const fixtures = [
      `
        import { doc } from 'firebase/firestore';
        type CollectionReference = { local: true };
        const settings: CollectionReference = getLocalReference();
        doc(settings, 'settings', 'profiles');
      `,
      `
        import { doc } from 'firebase/firestore';
        type DocumentReference = { local: true };
        const settings: DocumentReference = getLocalReference();
        doc(settings, 'profiles');
      `,
      `
        import { doc } from 'firebase/firestore';
        type Firestore = { local: true };
        const settings: Firestore = getLocalReference();
        doc(settings, 'accounts');
      `
    ];

    fixtures.forEach((source, index) => {
      expect(
        analyzeAccountProfileFirestoreSource(
          source,
          `src/routes/LocalTypeCollision-${index}.ts`
        )
      ).toBe(false);
    });
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

  it('detects Firebase parameters on anonymous default exports', () => {
    const defaultArrow = `
      import type { Firestore as Database } from 'firebase/firestore';
      type DatabaseAlias = Database;
      export default (db: DatabaseAlias) => db;
    `;
    const defaultFunction = `
      import type { Firestore as Database } from 'firebase/firestore';
      type DatabaseAlias = Database;
      export default function (db: DatabaseAlias): DatabaseAlias { return db; }
    `;

    expect(
      getExportedFirebaseParameterViolations(
        defaultArrow,
        'src/services/default-arrow.ts'
      )
    ).toEqual(['default: db']);
    expect(
      getExportedFirebaseParameterViolations(
        defaultFunction,
        'src/services/default-function.ts'
      )
    ).toEqual(['default: db']);
  });

  it('detects initializeApp calls made through an import alias', () => {
    const source = `
      import { initializeApp as init } from 'firebase/app';
      init(config);
    `;

    expect(getInitializeAppCalls(source, 'src/lib/other.ts')).toHaveLength(1);
  });

  it('detects initializeApp callable aliases and direct re-exports', () => {
    const callableAlias = `
      import { initializeApp } from 'firebase/app';
      const init = initializeApp;
      init(config);
    `;
    const directReExport =
      "export { initializeApp as init } from 'firebase/app';";
    const exportedCallableAlias = `
      import { initializeApp } from 'firebase/app';
      export const init = initializeApp;
    `;

    expect(
      getInitializeAppCalls(callableAlias, 'src/lib/callable-alias.ts')
    ).toHaveLength(1);
    expect(
      getInitializeAppCalls(directReExport, 'src/lib/re-export.ts')
    ).toHaveLength(1);
    expect(
      getInitializeAppCalls(exportedCallableAlias, 'src/lib/exported-alias.ts')
    ).toHaveLength(1);
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
