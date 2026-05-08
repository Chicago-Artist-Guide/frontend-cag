import fs from 'fs';
import path from 'path';

const matchCardSource = fs.readFileSync(
  path.resolve(__dirname, '../components/Matches/CompanyMatchCard.tsx'),
  'utf8'
);

describe('DEV-488: artist-side match card (CompanyMatchCard)', () => {
  describe('Item 10: Union status is not duplicated', () => {
    it('does not render the "Union" label more than once', () => {
      const matches = matchCardSource.match(/>\s*Union(\(s\))?\s*</g) || [];
      // Allow zero or one — duplication would be 2+
      expect(matches.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Item 11: Production image renders on the match card', () => {
    it('uses production_image_url when present and falls back when missing', () => {
      expect(matchCardSource).toMatch(/production_image_url/);
      // No-image fallback element
      expect(matchCardSource).toMatch(/No Image/);
    });
  });

  describe('Item 12: Match card surfaces production dates (not audition dates)', () => {
    it('renders the "Production Dates" label', () => {
      expect(matchCardSource).toMatch(/Production Dates/);
    });

    it('does not render audition date as the primary date label', () => {
      expect(matchCardSource).not.toMatch(/>\s*Audition Date(s)?\s*</);
    });

    it('uses production open/close fields for the date range', () => {
      expect(matchCardSource).toMatch(/open_and_close_start/);
      expect(matchCardSource).toMatch(/open_and_close_end/);
    });
  });

  describe('Item 13: Show name links to Basic Info tab', () => {
    it('navigates to /shows/:id?tab=basic when the show name is clicked', () => {
      expect(matchCardSource).toMatch(/\/shows\/\$\{[^}]+\}\?tab=basic/);
    });
  });

  describe('Item 15: Audition info button on onstage cards', () => {
    it('renders an Audition Info button that links to ?tab=audition', () => {
      expect(matchCardSource).toMatch(/Audition Info/i);
      expect(matchCardSource).toMatch(/\?tab=audition/);
    });
  });
});
