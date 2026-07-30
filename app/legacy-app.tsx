'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const App = dynamic(() => import('../src/routes/App'), {
  ssr: false
});

const LegacyApp = () => <App />;

export default LegacyApp;
