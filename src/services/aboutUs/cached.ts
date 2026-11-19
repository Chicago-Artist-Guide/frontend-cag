import { doc, getDoc } from 'firebase/firestore';
import { unstable_cache } from 'next/cache';
import { getServerFirestore } from '../../lib/firebase/server';
import {
  type AboutPageContent,
  toAboutPageContent
} from '../../components/WhoWeAre/aboutPageContent';

// Short window so an admin's publish shows up on /about-us within a minute.
// A failed read (rules not yet deployed, CI placeholder config) renders the
// built-in defaults rather than breaking the page.
export const getCachedAboutContent = unstable_cache(
  async (): Promise<AboutPageContent> => {
    try {
      const snapshot = await getDoc(
        doc(getServerFirestore(), 'site_content', 'about_us')
      );
      return toAboutPageContent(snapshot.data());
    } catch (error) {
      console.error('About Us content read failed; using defaults', error);
      return toAboutPageContent();
    }
  },
  ['about-us-content-v2'],
  { revalidate: 60, tags: ['about-us'] }
);
