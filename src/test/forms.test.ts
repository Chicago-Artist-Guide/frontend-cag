import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..');

const readSource = (relativePath: string) =>
  fs.readFileSync(path.resolve(repoRoot, relativePath), 'utf8');

describe('DEV-488: Signup + edit form contracts', () => {
  describe('Item 1: signup ethnicity selector excludes the Asian parent', () => {
    it('renders Asian sub-options without a parent Asian checkbox in ActorInfo1', () => {
      const src = readSource('components/SignUp/Individual/ActorInfo1.tsx');
      // Source explicitly skips the Asian parent and only renders sub-values
      expect(src).toMatch(
        /Asian:\s*only\s+show\s+granular\s+sub-options,\s+no\s+parent\s+checkbox/i
      );
      // Ensure no first-level checkbox is rendered for the Asian umbrella
      expect(src).toMatch(/eth\.name\s*===\s*'Asian'/);
    });

    it('renders Asian sub-options without a parent Asian checkbox in EditPersonalDetails', () => {
      const src = readSource(
        'components/Profile/Individual/EditPersonalDetails.tsx'
      );
      expect(src).toMatch(
        /Asian:\s*only\s+show\s+granular\s+sub-options,\s+no\s+parent\s+checkbox/i
      );
      expect(src).toMatch(/eth\.name\s*===\s*'Asian'/);
    });
  });

  describe('Item 2: Height "I do not wish to answer" auto-unchecks on entry', () => {
    it('clears height_no_answer when an actor enters a height value (edit profile)', () => {
      const src = readSource(
        'components/Profile/Individual/EditPersonalDetails.tsx'
      );
      // Both feet and inches handlers must reset height_no_answer to false
      const heightHandlers = src.match(
        /setProfileForm\('height_no_answer',\s*false\)/g
      );
      expect(heightHandlers).not.toBeNull();
      // One for the feet onChange and one for the inches onChange
      expect(heightHandlers?.length ?? 0).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Item 3: Singing & Dancing required at signup for onstage/both profiles', () => {
    it('marks both fields required when stageRole is not "off-stage"', () => {
      const src = readSource('components/SignUp/Individual/ActorInfo.tsx');
      expect(src).toMatch(/'actorInfoSinging'/);
      expect(src).toMatch(/'actorInfoDancing'/);
      // Both fields are pushed inside the !isOffStage block
      expect(src).toMatch(
        /if\s*\(!isOffStage\)\s*{[\s\S]*?actorInfoSinging[\s\S]*?actorInfoDancing[\s\S]*?\)/m
      );
    });

    it('renders Singing/Dancing radios on the signup ActorInfo step', () => {
      const src = readSource('components/SignUp/Individual/ActorInfo.tsx');
      expect(src).toMatch(/Are you interested in roles that require singing/i);
      expect(src).toMatch(/Are you interested in roles that require dancing/i);
      expect(src).toMatch(/fieldType="radio"[\s\S]*?name="actorInfoSinging"/);
      expect(src).toMatch(/fieldType="radio"[\s\S]*?name="actorInfoDancing"/);
    });
  });

  describe('Item 4: match-criteria questions use Yes/No radios, not checkboxes', () => {
    it('LGBTQIA+ uses radios (signup)', () => {
      const src = readSource('components/SignUp/Individual/ActorInfo.tsx');
      expect(src).toMatch(/fieldType="radio"[\s\S]*?name="actorInfo1LGBTQ"/);
    });

    it('LGBTQIA+ uses radios (post-signup edit)', () => {
      const src = readSource(
        'components/Profile/Individual/EditPersonalDetails.tsx'
      );
      expect(src).toMatch(/fieldType="radio"[\s\S]*?name="actorInfo1LGBTQ"/);
    });
  });

  describe('Item 5: LGBTQ+ field editable in post-creation profile edit', () => {
    it('renders an LGBTQIA+ form group inside EditPersonalDetails', () => {
      const src = readSource(
        'components/Profile/Individual/EditPersonalDetails.tsx'
      );
      expect(src).toMatch(/LGBTQIA\+/);
      expect(src).toMatch(/setProfileForm\('lgbtqia',/);
    });

    it('persists lgbtqia when saving personal details', () => {
      const src = readSource('components/Profile/Individual/index.tsx');
      // The personal details payload must include the lgbtqia field
      expect(src).toMatch(
        /personalDetailsData\s*=\s*\{[\s\S]*?lgbtqia[\s\S]*?\}/m
      );
    });
  });

  describe('Item 6: gender option "I chose not to respond" is removed', () => {
    it('signup ActorInfo does not present a "do not wish/chose not" gender option', () => {
      const src = readSource('components/SignUp/Individual/ActorInfo.tsx');
      // Hunt for any gender option that suggests refusing to answer
      const genderBlock = src.match(/Gender Identity[\s\S]*?<\/Form\.Group>/);
      expect(genderBlock).not.toBeNull();
      expect(genderBlock?.[0] ?? '').not.toMatch(/chose\s+not\s+to\s+respond/i);
      expect(genderBlock?.[0] ?? '').not.toMatch(
        /do\s+not\s+wish\s+to\s+respond/i
      );
    });
  });

  describe('Item 7: Trans/Nonbinary requires sub-selection on signup', () => {
    it('flags actorInfo2GenderRoles as required when Trans/Nonbinary is chosen', () => {
      const src = readSource('components/SignUp/Individual/ActorInfo.tsx');
      expect(src).toMatch(
        /actorInfo2Gender\s*===\s*'Trans\/Nonbinary'[\s\S]*?actorInfo2GenderRoles/m
      );
    });

    it('blocks profile save until at least one gender_role is picked when Trans/Nonbinary', () => {
      const src = readSource('components/Profile/Individual/index.tsx');
      expect(src).toMatch(
        /gender_identity\s*===\s*'Trans\/Nonbinary'[\s\S]*?gender_roles[\s\S]*?length\s*===\s*0/m
      );
    });

    it('lets Trans/Nonbinary users edit on-stage gender role preferences post-signup', () => {
      const editSrc = readSource(
        'components/Profile/Individual/EditPersonalDetails.tsx'
      );
      const profileSrc = readSource('components/Profile/Individual/index.tsx');

      expect(editSrc).toMatch(
        /gender_identity\s*===\s*'Trans\/Nonbinary'[\s\S]*?genderRoleChange/m
      );
      expect(profileSrc).toMatch(/genderRoleChange/);
      expect(profileSrc).toMatch(
        /gender_roles:[\s\S]*?gender_identity\s*===\s*'Trans\/Nonbinary'/m
      );
    });
  });

  describe('Item 8: role creation ethnicity selector excludes Asian parent', () => {
    it('only renders Asian sub-options inside RoleModal', () => {
      const src = readSource(
        'components/Profile/Company/Production/Roles/RoleModal.tsx'
      );
      expect(src).toMatch(
        /Asian:\s*only\s+show\s+granular\s+options\s+\(no\s+parent\s+checkbox\)/i
      );
      expect(src).toMatch(/eth\.name\s*===\s*'Asian'/);
    });
  });

  describe('Item 9: Trans/Nonbinary role gender with required sub-selection', () => {
    it('exposes a Trans/Nonbinary checkbox on the role gender section', () => {
      const src = readSource(
        'components/Profile/Company/Production/Roles/RoleModal.tsx'
      );
      expect(src).toMatch(/label="Trans\/Nonbinary"/);
    });

    it('asks the company which roles trans/nonbinary actors can play', () => {
      const src = readSource(
        'components/Profile/Company/Production/Roles/RoleModal.tsx'
      );
      expect(src).toMatch(/trans_nonbinary_roles/);
      expect(src).toMatch(/Open to trans\/nonbinary actors playing/i);
    });

    it('refuses to save when Trans/Nonbinary is enabled without any sub-selection', () => {
      const src = readSource(
        'components/Profile/Company/Production/Roles/RoleModal.tsx'
      );
      // Validation block must check trans/nonbinary sub-selection length
      expect(src).toMatch(
        /isTransNonbinaryEnabled[\s\S]*?trans_nonbinary_roles[\s\S]*?length\s*===\s*0/m
      );
    });
  });

  describe('Item 14: Theatre lookup falls back across profile + account', () => {
    it('PublicShowCard resolves account by uid then prefers theatre_name with theater_name fallback', () => {
      const src = readSource('components/PublicShows/PublicShowCard.tsx');
      expect(src).toMatch(/getTheaterAccountByUid/);
      expect(src).toMatch(/theatre_name/);
      expect(src).toMatch(/theater_name/);
    });

    it('PublicShowDetail uses the same fallback path', () => {
      const src = readSource('routes/PublicShowDetail.tsx');
      expect(src).toMatch(/getTheaterAccountByUid/);
      expect(src).toMatch(/theatre_name/);
      expect(src).toMatch(/theater_name/);
    });

    it('CompanyMatchCard uses the same fallback path for the by-line theater name', () => {
      const src = readSource('components/Matches/CompanyMatchCard.tsx');
      expect(src).toMatch(/getTheaterAccountByUid/);
      expect(src).toMatch(/theatre_name/);
      expect(src).toMatch(/theater_name/);
    });
  });

  describe('Item 16: Gender Identity, Ethnicity, and LGBTQ+ are private fields', () => {
    it('IndividualProfile gates Gender Identity behind !previewMode', () => {
      const src = readSource('components/Profile/Individual/index.tsx');
      expect(src).toMatch(/!previewMode\s*&&[\s\S]*?gender_identity/m);
    });

    it('IndividualProfile gates Ethnicity behind !previewMode', () => {
      const src = readSource('components/Profile/Individual/index.tsx');
      expect(src).toMatch(/!previewMode\s*&&[\s\S]*?ethnicities/m);
    });

    it('does not leak LGBTQIA+ state into the public-facing detail block', () => {
      const src = readSource('components/Profile/Individual/index.tsx');
      // The non-edit details block must never render lgbtqia regardless of mode
      const detailsRender = src.split("editMode['personalDetails']")[1] ?? '';
      expect(detailsRender).not.toMatch(/lgbtqia/);
      expect(detailsRender).not.toMatch(/LGBTQIA/);
    });
  });
});
