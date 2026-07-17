import { constants } from 'node:fs';
import { open } from 'node:fs/promises';
import path from 'node:path';
import type { AuthState, BaselinePolicy, VisualCase } from './manifest';

interface NameValue {
  name: string;
  value: string;
}

interface IndexedDbIndex {
  keyPath?: string;
  keyPathArray?: string[];
  multiEntry: boolean;
  name: string;
  unique: boolean;
}

interface IndexedDbRecord {
  key?: unknown;
  keyEncoded?: unknown;
  value?: unknown;
  valueEncoded?: unknown;
}

interface IndexedDbStore {
  autoIncrement: boolean;
  indexes: IndexedDbIndex[];
  keyPath?: string;
  keyPathArray?: string[];
  name: string;
  records: IndexedDbRecord[];
}

interface IndexedDbDatabase {
  name: string;
  stores: IndexedDbStore[];
  version: number;
}

interface OriginStorage {
  indexedDB: IndexedDbDatabase[];
  localStorage: NameValue[];
  origin: string;
}

export interface ValidatedAuthStorageState {
  cookies: [];
  origins: [OriginStorage];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const assertShape = (
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[],
  label: string
): void => {
  const allowed = [...required, ...optional];
  if (Object.keys(value).some((key) => !allowed.includes(key))) {
    throw new Error(`${label} has an unknown field`);
  }
  if (required.some((key) => !(key in value))) {
    throw new Error(`${label} is missing a required field`);
  }
};

const requireString = (value: unknown, label: string): string => {
  if (typeof value !== 'string') throw new Error(`${label} must be a string`);
  return value;
};

const requireStringArray = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${label} must be a string array`);
  }
  return [...value];
};

const canonicalOrigin = (raw: string, label: string): string => {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${label} must be a canonical HTTP(S) origin`);
  }
  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.pathname !== '/' ||
    url.search.length > 0 ||
    url.hash.length > 0 ||
    raw !== url.origin
  ) {
    throw new Error(`${label} must be a canonical HTTP(S) origin`);
  }
  return url.origin;
};

const validateNameValues = (value: unknown): NameValue[] => {
  if (!Array.isArray(value))
    throw new Error('auth localStorage must be an array');
  const entries = value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`auth localStorage ${index} must be an object`);
    }
    assertShape(item, ['name', 'value'], [], `auth localStorage ${index}`);
    return {
      name: requireString(item.name, `auth localStorage ${index}.name`),
      value: requireString(item.value, `auth localStorage ${index}.value`)
    };
  });
  if (new Set(entries.map(({ name }) => name)).size !== entries.length) {
    throw new Error('auth localStorage names must be unique');
  }
  return entries;
};

const validateIndexes = (value: unknown, label: string): IndexedDbIndex[] => {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  return value.map((item, index) => {
    const itemLabel = `${label} ${index}`;
    if (!isRecord(item)) throw new Error(`${itemLabel} must be an object`);
    assertShape(
      item,
      ['multiEntry', 'name', 'unique'],
      ['keyPath', 'keyPathArray'],
      itemLabel
    );
    if (
      typeof item.multiEntry !== 'boolean' ||
      typeof item.unique !== 'boolean'
    ) {
      throw new Error(`${itemLabel} flags must be boolean`);
    }
    if (item.keyPath !== undefined && typeof item.keyPath !== 'string') {
      throw new Error(`${itemLabel}.keyPath must be a string`);
    }
    const keyPathArray =
      item.keyPathArray === undefined
        ? undefined
        : requireStringArray(item.keyPathArray, `${itemLabel}.keyPathArray`);
    return {
      ...(item.keyPath !== undefined ? { keyPath: item.keyPath } : {}),
      ...(keyPathArray !== undefined ? { keyPathArray } : {}),
      multiEntry: item.multiEntry,
      name: requireString(item.name, `${itemLabel}.name`),
      unique: item.unique
    };
  });
};

const validateRecords = (value: unknown, label: string): IndexedDbRecord[] => {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  return value.map((item, index) => {
    const itemLabel = `${label} ${index}`;
    if (!isRecord(item)) throw new Error(`${itemLabel} must be an object`);
    assertShape(
      item,
      [],
      ['key', 'keyEncoded', 'value', 'valueEncoded'],
      itemLabel
    );
    const valueForms = Number('value' in item) + Number('valueEncoded' in item);
    const keyForms = Number('key' in item) + Number('keyEncoded' in item);
    if (valueForms !== 1 || keyForms > 1) {
      throw new Error(`${itemLabel} is ambiguous`);
    }
    return structuredClone(item) as IndexedDbRecord;
  });
};

const validateDatabases = (value: unknown): IndexedDbDatabase[] => {
  if (!Array.isArray(value)) throw new Error('auth IndexedDB must be an array');
  return value.map((database, databaseIndex) => {
    const databaseLabel = `auth IndexedDB database ${databaseIndex}`;
    if (!isRecord(database))
      throw new Error(`${databaseLabel} must be an object`);
    assertShape(database, ['name', 'stores', 'version'], [], databaseLabel);
    if (
      !Number.isInteger(database.version) ||
      (database.version as number) <= 0
    ) {
      throw new Error(`${databaseLabel}.version must be a positive integer`);
    }
    if (!Array.isArray(database.stores)) {
      throw new Error(`${databaseLabel}.stores must be an array`);
    }
    const stores = database.stores.map((store, storeIndex) => {
      const storeLabel = `${databaseLabel} store ${storeIndex}`;
      if (!isRecord(store)) throw new Error(`${storeLabel} must be an object`);
      assertShape(
        store,
        ['autoIncrement', 'indexes', 'name', 'records'],
        ['keyPath', 'keyPathArray'],
        storeLabel
      );
      if (typeof store.autoIncrement !== 'boolean') {
        throw new Error(`${storeLabel}.autoIncrement must be boolean`);
      }
      if (store.keyPath !== undefined && typeof store.keyPath !== 'string') {
        throw new Error(`${storeLabel}.keyPath must be a string`);
      }
      const keyPathArray =
        store.keyPathArray === undefined
          ? undefined
          : requireStringArray(
              store.keyPathArray,
              `${storeLabel}.keyPathArray`
            );
      return {
        autoIncrement: store.autoIncrement,
        indexes: validateIndexes(store.indexes, `${storeLabel}.indexes`),
        ...(store.keyPath !== undefined ? { keyPath: store.keyPath } : {}),
        ...(keyPathArray !== undefined ? { keyPathArray } : {}),
        name: requireString(store.name, `${storeLabel}.name`),
        records: validateRecords(store.records, `${storeLabel}.records`)
      };
    });
    return {
      name: requireString(database.name, `${databaseLabel}.name`),
      stores,
      version: database.version as number
    };
  });
};

export function validateAuthStorageState(
  value: unknown,
  expectedOrigin: string
): ValidatedAuthStorageState {
  const expected = canonicalOrigin(expectedOrigin, 'VR_BASE_URL');
  if (!isRecord(value)) throw new Error('auth storage state must be an object');
  assertShape(value, ['cookies', 'origins'], [], 'auth storage state');
  if (!Array.isArray(value.cookies) || value.cookies.length !== 0) {
    throw new Error('auth storage state cookies must be empty');
  }
  if (!Array.isArray(value.origins) || value.origins.length !== 1) {
    throw new Error('auth storage state must contain exactly one origin');
  }
  const origin = value.origins[0];
  if (!isRecord(origin)) throw new Error('auth origin must be an object');
  assertShape(
    origin,
    ['indexedDB', 'localStorage', 'origin'],
    [],
    'auth origin'
  );
  const actualOrigin = canonicalOrigin(
    requireString(origin.origin, 'auth origin.origin'),
    'auth origin.origin'
  );
  if (actualOrigin !== expected) throw new Error('auth state origin drift');
  const indexedDB = validateDatabases(origin.indexedDB);
  const firebaseDatabases = indexedDB.filter(
    ({ name }) => name === 'firebaseLocalStorageDb'
  );
  if (firebaseDatabases.length !== 1 || firebaseDatabases[0].version !== 1) {
    throw new Error('auth state lacks unambiguous Firebase IndexedDB evidence');
  }
  const firebaseStores = firebaseDatabases[0].stores.filter(
    ({ name }) => name === 'firebaseLocalStorage'
  );
  if (firebaseStores.length !== 1) {
    throw new Error('auth state lacks unambiguous Firebase store evidence');
  }
  const firebaseStore = firebaseStores[0];
  if (
    firebaseStore.autoIncrement ||
    firebaseStore.keyPath !== 'fbase_key' ||
    firebaseStore.keyPathArray !== undefined ||
    firebaseStore.indexes.length !== 0
  ) {
    throw new Error('auth state Firebase store schema is invalid');
  }
  const authRecords = firebaseStore.records.filter((record) => {
    if (
      Object.keys(record).length !== 1 ||
      !isRecord(record.value) ||
      typeof record.value.fbase_key !== 'string'
    ) {
      return false;
    }
    return record.value.fbase_key.startsWith('firebase:authUser:');
  });
  if (authRecords.length !== 1) {
    throw new Error('auth state lacks unambiguous Firebase auth evidence');
  }
  return {
    cookies: [],
    origins: [
      {
        indexedDB,
        localStorage: validateNameValues(origin.localStorage),
        origin: actualOrigin
      }
    ]
  };
}

export interface LoadAuthStateOptions {
  auth: Exclude<AuthState, 'anonymous'>;
  authDir: string;
  baseUrl: string;
  baselinePolicy: BaselinePolicy;
}

export async function loadAuthState(
  options: LoadAuthStateOptions
): Promise<ValidatedAuthStorageState> {
  if (options.auth === 'admin' || options.auth === 'individual') {
    throw new Error(`${options.auth} auth state is forbidden in this phase`);
  }
  if (options.baselinePolicy.kind !== 'reference-only') {
    throw new Error('company auth evidence must remain reference-only');
  }
  const statePath = path.join(options.authDir, 'company.json');
  let handle;
  try {
    handle = await open(statePath, constants.O_RDONLY | constants.O_NOFOLLOW);
    const metadata = await handle.stat();
    if (
      !metadata.isFile() ||
      metadata.size > 1024 * 1024 ||
      (metadata.mode & 0o077) !== 0
    ) {
      throw new Error('unsafe');
    }
  } catch {
    await handle?.close().catch(() => undefined);
    throw new Error('company auth state file is unsafe');
  }
  let source: string;
  try {
    source = await handle.readFile('utf8');
  } finally {
    await handle.close();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new Error('company auth state is malformed JSON');
  }
  return validateAuthStorageState(parsed, new URL(options.baseUrl).origin);
}

type AuthStateLoader = (
  options: LoadAuthStateOptions
) => Promise<ValidatedAuthStorageState>;

export async function loadSelectedAuthStates(
  cases: readonly VisualCase[],
  authDir: string,
  baseUrl: string,
  loader: AuthStateLoader = loadAuthState
): Promise<Map<Exclude<AuthState, 'anonymous'>, ValidatedAuthStorageState>> {
  const authenticated = cases.filter(({ entry }) => entry.auth !== 'anonymous');
  for (const { entry } of authenticated) {
    if (entry.auth === 'admin' || entry.auth === 'individual') {
      throw new Error(`${entry.auth} auth state is forbidden in this phase`);
    }
    if (entry.baselinePolicy.kind !== 'reference-only') {
      throw new Error('company auth evidence must remain reference-only');
    }
  }
  const states = new Map<
    Exclude<AuthState, 'anonymous'>,
    ValidatedAuthStorageState
  >();
  if (authenticated.length > 0) {
    const firstCompany = authenticated[0].entry;
    states.set(
      'company',
      await loader({
        auth: 'company',
        authDir,
        baseUrl,
        baselinePolicy: firstCompany.baselinePolicy
      })
    );
  }
  return states;
}
