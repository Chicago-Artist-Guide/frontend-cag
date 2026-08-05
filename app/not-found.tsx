import React from 'react';
import NotFound from '../src/routes/NotFound';
import SiteShell from './site-shell';

// Rendered with HTTP 404 whenever a route calls notFound(). This lives
// outside the (main) route group, so it wraps itself in the site shell
// the same way MainLayout does for real pages.
const NotFoundPage = () => (
  <SiteShell>
    <NotFound />
  </SiteShell>
);

export default NotFoundPage;
