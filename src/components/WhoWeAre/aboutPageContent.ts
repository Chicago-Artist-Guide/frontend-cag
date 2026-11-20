import bios from './bios';

// The About Us page content (text, team sections and cards), editable from
// /admin/about-us. Stored as the public-read Firestore document
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

export interface TeamSection {
  hidden: boolean;
  id: string;
  members: TeamMember[];
  title: string;
}

export interface AboutPageContent {
  mission: string;
  sections: TeamSection[];
  vision: string;
}

type LegacyTeam = Partial<Record<SectionKey, TeamMember[]>>;

// Docs published before sections existed store `team`, keyed by SectionKey.
const toSections = (team: LegacyTeam = {}): TeamSection[] =>
  (Object.keys(sectionTitles) as SectionKey[]).map((id) => ({
    hidden: false,
    id,
    members: Array.isArray(team[id])
      ? team[id]
      : (bios as Record<SectionKey, TeamMember[]>)[id],
    title: sectionTitles[id]
  }));

export const defaultAboutPageContent: AboutPageContent = {
  mission:
    'To diversify Chicago theatre with a centralized online network for artists, producers, and community groups.',
  sections: toSections(),
  vision: 'Theatre for everyone, made by anyone.'
};

// Firestore data is untrusted shape-wise: drop malformed sections and fall
// back to defaults for anything missing, so a partial doc never blanks the page.
export const toAboutPageContent = (
  data?: Partial<AboutPageContent> & { team?: LegacyTeam }
): AboutPageContent => ({
  mission: data?.mission ?? defaultAboutPageContent.mission,
  sections: Array.isArray(data?.sections)
    ? data.sections
        .filter((s) => Array.isArray(s?.members))
        .map((s) => ({ ...s, hidden: s.hidden === true }))
    : toSections(data?.team),
  vision: data?.vision ?? defaultAboutPageContent.vision
});

// Props for layout/Collapsible, which takes maps keyed by section. Section ids
// are never integer-like, so the maps keep the sections' order.
export const toCollapsibleProps = (sections: TeamSection[]) => {
  const shown = sections.filter((s) => !s.hidden);
  return {
    sectionTitles: Object.fromEntries(shown.map((s) => [s.id, s.title])),
    subSections: Object.fromEntries(shown.map((s) => [s.id, s.members]))
  };
};

// Team.tsx builds the profile URL from a bare handle, so strip pasted URLs.
export const toLinkedinHandle = (value: string | null) =>
  (value ?? '')
    .trim()
    .replace(/^.*linkedin\.com\/in\//i, '')
    .replace(/[/?#].*$/, '') || null;
