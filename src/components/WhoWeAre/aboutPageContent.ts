import bios from './bios';

// The About Us page content (text, section titles and team cards), editable
// from /admin/about-us. Stored as the public-read Firestore document
// site_content/about_us; until an admin first publishes it, the page renders
// the defaults below (the hand-maintained bios.ts).

export const sectionTitles = {
  board: 'BOARD OF DIRECTORS',
  artists: 'ARTIST COUNCIL',
  operations: 'BUSINESS OPERATIONS',
  technical: 'SITE DEVELOPMENT',
  artistAdvisory: 'ADVISORY BOARD'
};

export type SectionKey = keyof typeof sectionTitles;

export interface TeamMember {
  affiliation: string | null;
  bio: string;
  id: string;
  image: string | null;
  linkedin: string | null;
  name: string;
  pronouns: string;
  role: string;
}

export interface AboutPageContent {
  mission: string;
  team: Record<SectionKey, TeamMember[]>;
  titles: Record<SectionKey, string>;
  vision: string;
}

export const defaultAboutPageContent: AboutPageContent = {
  mission:
    'To diversify Chicago theatre with a centralized online network for artists, producers, and community groups.',
  team: bios as Record<SectionKey, TeamMember[]>,
  titles: sectionTitles,
  vision: 'Theatre for everyone, made by anyone.'
};

// Firestore data is untrusted shape-wise: keep only known sections and fall
// back to defaults for anything missing, so a partial doc never blanks the page.
export const toAboutPageContent = (
  data?: Partial<AboutPageContent>
): AboutPageContent => {
  const team = { ...defaultAboutPageContent.team };
  const titles = { ...sectionTitles };
  for (const key of Object.keys(sectionTitles) as SectionKey[]) {
    if (Array.isArray(data?.team?.[key])) team[key] = data.team[key];
    const title = data?.titles?.[key];
    if (typeof title === 'string' && title.trim()) titles[key] = title.trim();
  }

  return {
    mission: data?.mission ?? defaultAboutPageContent.mission,
    team,
    titles,
    vision: data?.vision ?? defaultAboutPageContent.vision
  };
};

// Team.tsx builds the profile URL from a bare handle, so strip pasted URLs.
export const toLinkedinHandle = (value: string | null) =>
  (value ?? '')
    .trim()
    .replace(/^.*linkedin\.com\/in\//i, '')
    .replace(/[/?#].*$/, '') || null;
