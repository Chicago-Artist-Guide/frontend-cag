import {
  defaultAboutPageContent,
  toAboutPageContent,
  toLinkedinHandle
} from './aboutPageContent';

describe('toAboutPageContent', () => {
  it('returns the built-in content when nothing is published', () => {
    expect(toAboutPageContent()).toEqual(defaultAboutPageContent);
  });

  it('uses published fields and keeps defaults for missing ones', () => {
    const member = {
      affiliation: null,
      bio: 'is new.',
      id: 'm1',
      image: null,
      linkedin: null,
      name: 'New Person',
      pronouns: 'they/them',
      role: 'Member'
    };
    const content = toAboutPageContent({
      team: { board: [member] } as never,
      vision: 'New vision'
    });

    expect(content.vision).toBe('New vision');
    expect(content.mission).toBe(defaultAboutPageContent.mission);
    expect(content.team.board).toEqual([member]);
    expect(content.team.artists).toBe(defaultAboutPageContent.team.artists);
  });

  it('uses published section titles and falls back for blank ones', () => {
    const content = toAboutPageContent({
      titles: { artists: ' Artist Council ', board: '  ' } as never
    });

    expect(content.titles.artists).toBe('Artist Council');
    expect(content.titles.board).toBe(defaultAboutPageContent.titles.board);
    expect(content.titles.technical).toBe(
      defaultAboutPageContent.titles.technical
    );
  });
});

describe('toLinkedinHandle', () => {
  it.each([
    ['https://www.linkedin.com/in/jane-doe/', 'jane-doe'],
    ['linkedin.com/in/jane-doe?utm=x', 'jane-doe'],
    [' jane-doe ', 'jane-doe'],
    ['', null],
    [null, null]
  ])('%s -> %s', (input, expected) => {
    expect(toLinkedinHandle(input)).toBe(expected);
  });
});
