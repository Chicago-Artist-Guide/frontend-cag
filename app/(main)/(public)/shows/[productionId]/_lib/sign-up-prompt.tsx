'use client';

import Link from 'next/link';
import React from 'react';
import { useUserContext } from '../../../../../../src/context/UserContext';

// Whether to show this is per-visitor (anonymous vs. signed-in), so it can't
// live in the server-rendered, cache-shared parent — see page.tsx's
// `revalidate`/`unstable_cache` comments. Isolating just this line to a
// client child keeps the rest of the page cacheable. `useUserContext()` has
// a real value here (not just its default): app/site-shell.tsx wraps every
// page under app/(main)/layout.tsx, including this route, in the same
// FirebaseContext/UserContext providers the legacy app uses.
const SignUpPrompt = () => {
  const { currentUser } = useUserContext();

  if (currentUser) {
    return null;
  }

  return (
    <p className="text-center font-montserrat text-sm text-grayishBlue [&_a]:text-mint [&_a]:no-underline [&_a]:hover:underline">
      <Link href="/sign-up">Sign up</Link> or <Link href="/login">log in</Link>{' '}
      to apply directly to roles
    </p>
  );
};

export default SignUpPrompt;
