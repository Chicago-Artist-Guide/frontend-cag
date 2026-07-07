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

  describe('Artist matching: Apply, Hide, and favorites', () => {
    it('labels the green action Apply and the red action Hide', () => {
      expect(matchCardSource).toMatch(/>\s*Apply\s*</);
      expect(matchCardSource).toMatch(/>\s*Hide\s*</);
      expect(matchCardSource).not.toMatch(/>\s*Approve(d)?\s*</i);
    });

    it('renders a favorite star control', () => {
      expect(matchCardSource).toMatch(/Favorite role/);
      expect(matchCardSource).toMatch(/onToggleFavorite/);
    });

    it('confirm modal copy refers to applying, not expressing interest', () => {
      expect(matchCardSource).toMatch(/apply for the following role/i);
      expect(matchCardSource).not.toMatch(
        /express interest in the following role/i
      );
    });
  });
});

describe('Artist show overview from match card', () => {
  const showDetailSource = fs.readFileSync(
    path.resolve(__dirname, '../routes/PublicShowDetail.tsx'),
    'utf8'
  );
  const filterBarSource = fs.readFileSync(
    path.resolve(__dirname, '../components/Matches/RoleMatchesFilterBar.tsx'),
    'utf8'
  );

  it('does not offer show-level Apply for Role or Express Interest CTAs', () => {
    expect(showDetailSource).not.toMatch(/Apply for Role/i);
    expect(showDetailSource).not.toMatch(/Express Interest In This Show/i);
  });

  it('exposes Basic Info and Audition Info tabs for full show context', () => {
    expect(showDetailSource).toMatch(/eventKey="basic"/);
    expect(showDetailSource).toMatch(/eventKey="audition"/);
    expect(showDetailSource).toMatch(/ShowDescription/);
  });

  it('offers multi-select role status filters for artists', () => {
    expect(filterBarSource).toMatch(/Applied/);
    expect(filterBarSource).toMatch(/Hidden/);
    expect(filterBarSource).toMatch(/Favorite/);
    expect(filterBarSource).toMatch(/Undecided/);
    expect(filterBarSource).toMatch(/type="checkbox"/);
  });
});

describe('Theatre talent match filters', () => {
  const filterBarSource = fs.readFileSync(
    path.resolve(__dirname, '../components/Matches/TalentMatchesFilterBar.tsx'),
    'utf8'
  );

  it('offers multi-select match status filters including Favorite', () => {
    expect(filterBarSource).toMatch(/Accepted/);
    expect(filterBarSource).toMatch(/Declined/);
    expect(filterBarSource).toMatch(/Interested/);
    expect(filterBarSource).toMatch(/Favorite/);
    expect(filterBarSource).toMatch(/Undecided/);
    expect(filterBarSource).toMatch(/type="checkbox"/);
  });

  it('allows editing role status from the filter bar', () => {
    expect(filterBarSource).toMatch(/label="Role Status"/);
    expect(filterBarSource).toMatch(
      /By closing this role, you will automatically send a decline message/
    );
  });
});
