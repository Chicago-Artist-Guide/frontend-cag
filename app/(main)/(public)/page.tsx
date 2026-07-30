import { redirect } from 'next/navigation';

// `/` redirects to `/home` — the same contract the legacy SPA had, where the
// React Router table answered `/` with <Navigate to="/home" replace />.
//
// The only thing that changes here is WHERE the redirect happens: it is issued
// by the server on the first request instead of after the client bundle boots,
// so `/` no longer ships an empty shell and waits for JavaScript. The
// destination, and therefore every inbound link and bookmark, is unchanged.
//
// This deliberately does NOT canonicalize the site onto `/`. Which URL is the
// canonical home is a product decision, not part of a rendering migration.
const RootPage = () => {
  redirect('/home');
};

export default RootPage;
