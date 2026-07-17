const firebaseMocks = vi.hoisted(() => ({
  apps: [] as Array<{ name: string }>,
  defaultApp: { name: '[DEFAULT]' },
  namedApp: { name: 'admin-secondary' },
  analytics: { type: 'analytics' },
  auth: { type: 'auth' },
  firestore: { type: 'firestore' },
  storage: { type: 'storage' },
  getAnalytics: vi.fn(),
  getApp: vi.fn(),
  getApps: vi.fn(),
  getAuth: vi.fn(),
  getFirestore: vi.fn(),
  getStorage: vi.fn(),
  initializeApp: vi.fn(),
  isSupported: vi.fn()
}));

const configState = vi.hoisted(() => ({
  config: {
    apiKey: 'api-key',
    appId: 'app-id',
    authDomain: 'project.firebaseapp.com',
    measurementId: 'measurement-id',
    messagingSenderId: 'sender-id',
    projectId: 'project',
    storageBucket: 'project.appspot.com'
  }
}));

vi.mock('../../config/publicEnv', () => ({
  firebaseClientConfig: configState.config
}));

vi.mock('firebase/app', () => ({
  getApp: firebaseMocks.getApp,
  getApps: firebaseMocks.getApps,
  initializeApp: firebaseMocks.initializeApp
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: firebaseMocks.getAnalytics,
  isSupported: firebaseMocks.isSupported
}));

vi.mock('firebase/auth', () => ({ getAuth: firebaseMocks.getAuth }));
vi.mock('firebase/firestore', () => ({
  getFirestore: firebaseMocks.getFirestore
}));
vi.mock('firebase/storage', () => ({ getStorage: firebaseMocks.getStorage }));

const sdkMocks = [
  firebaseMocks.getAnalytics,
  firebaseMocks.getApp,
  firebaseMocks.getApps,
  firebaseMocks.getAuth,
  firebaseMocks.getFirestore,
  firebaseMocks.getStorage,
  firebaseMocks.initializeApp,
  firebaseMocks.isSupported
];

describe('browser Firebase client', () => {
  beforeEach(() => {
    vi.resetModules();
    firebaseMocks.apps = [];
    configState.config.measurementId = 'measurement-id';

    for (const mock of sdkMocks) {
      mock.mockReset();
    }

    firebaseMocks.getApps.mockImplementation(() => firebaseMocks.apps);
    firebaseMocks.getApp.mockImplementation(() => firebaseMocks.defaultApp);
    firebaseMocks.initializeApp.mockImplementation(() => {
      firebaseMocks.apps.push(firebaseMocks.defaultApp);
      return firebaseMocks.defaultApp;
    });
    firebaseMocks.getAuth.mockReturnValue(firebaseMocks.auth);
    firebaseMocks.getFirestore.mockReturnValue(firebaseMocks.firestore);
    firebaseMocks.getStorage.mockReturnValue(firebaseMocks.storage);
    firebaseMocks.getAnalytics.mockReturnValue(firebaseMocks.analytics);
    firebaseMocks.isSupported.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('performs no Firebase SDK work when the module is imported', async () => {
    await import('./client');

    for (const mock of sdkMocks) {
      expect(mock).not.toHaveBeenCalled();
    }
  });

  it('initializes and caches one default browser client', async () => {
    const { getFirebaseClient } = await import('./client');

    const first = getFirebaseClient();
    const second = getFirebaseClient();

    expect(second).toBe(first);
    expect(first).toEqual({
      app: firebaseMocks.defaultApp,
      auth: firebaseMocks.auth,
      firestore: firebaseMocks.firestore,
      storage: firebaseMocks.storage
    });
    expect(firebaseMocks.initializeApp).toHaveBeenCalledOnce();
    expect(firebaseMocks.initializeApp).toHaveBeenCalledWith(
      configState.config
    );
    expect(firebaseMocks.getAuth).toHaveBeenCalledOnce();
    expect(firebaseMocks.getFirestore).toHaveBeenCalledOnce();
    expect(firebaseMocks.getStorage).toHaveBeenCalledOnce();
  });

  it('initializes the default app when only a named app exists', async () => {
    firebaseMocks.apps = [firebaseMocks.namedApp];
    const { getFirebaseClient } = await import('./client');

    const client = getFirebaseClient();

    expect(client.app).toBe(firebaseMocks.defaultApp);
    expect(firebaseMocks.getApp).not.toHaveBeenCalled();
    expect(firebaseMocks.initializeApp).toHaveBeenCalledOnce();
  });

  it('reuses the existing default app after a module reload', async () => {
    const firstModule = await import('./client');
    const firstClient = firstModule.getFirebaseClient();

    vi.resetModules();
    const reloadedModule = await import('./client');
    const reloadedClient = reloadedModule.getFirebaseClient();

    expect(firstClient.app).toBe(firebaseMocks.defaultApp);
    expect(reloadedClient.app).toBe(firebaseMocks.defaultApp);
    expect(firebaseMocks.initializeApp).toHaveBeenCalledOnce();
    expect(firebaseMocks.getApp).toHaveBeenCalledOnce();
  });

  it('rejects server client access before calling the Firebase SDK', async () => {
    const { getFirebaseClient } = await import('./client');
    vi.stubGlobal('window', undefined);

    expect(() => getFirebaseClient()).toThrow(/browser/i);

    for (const mock of sdkMocks) {
      expect(mock).not.toHaveBeenCalled();
    }
  });

  it('returns null analytics on the server without checking support', async () => {
    const { getFirebaseAnalytics } = await import('./client');
    vi.stubGlobal('window', undefined);

    await expect(getFirebaseAnalytics()).resolves.toBeNull();
    expect(firebaseMocks.isSupported).not.toHaveBeenCalled();
    expect(firebaseMocks.getAnalytics).not.toHaveBeenCalled();
  });

  it('returns null analytics without a measurement ID or support check', async () => {
    configState.config.measurementId = '';
    const { getFirebaseAnalytics } = await import('./client');

    await expect(getFirebaseAnalytics()).resolves.toBeNull();
    expect(firebaseMocks.isSupported).not.toHaveBeenCalled();
    expect(firebaseMocks.getAnalytics).not.toHaveBeenCalled();
  });

  it.each([
    ['unsupported', () => Promise.resolve(false)],
    ['support check rejection', () => Promise.reject(new Error('blocked'))]
  ])('returns null analytics when Analytics is %s', async (_label, support) => {
    firebaseMocks.isSupported.mockImplementation(support);
    const { getFirebaseAnalytics } = await import('./client');

    await expect(getFirebaseAnalytics()).resolves.toBeNull();
    expect(firebaseMocks.getAnalytics).not.toHaveBeenCalled();
    expect(firebaseMocks.initializeApp).not.toHaveBeenCalled();
  });

  it('caches Analytics support and initialization in one promise', async () => {
    const { getFirebaseAnalytics } = await import('./client');

    const first = getFirebaseAnalytics();
    const second = getFirebaseAnalytics();

    expect(second).toBe(first);
    await expect(first).resolves.toBe(firebaseMocks.analytics);
    expect(firebaseMocks.isSupported).toHaveBeenCalledOnce();
    expect(firebaseMocks.getAnalytics).toHaveBeenCalledOnce();
    expect(firebaseMocks.getAnalytics).toHaveBeenCalledWith(
      firebaseMocks.defaultApp
    );
  });
});
