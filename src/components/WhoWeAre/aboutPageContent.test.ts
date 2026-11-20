import {
  defaultAboutPageContent,
  toAboutPageContent,
  toCollapsibleProps,
  toLinkedinHandle
} from './aboutPageContent';

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

describe('toAboutPageContent', () => {
  it('returns the built-in content when nothing is published', () => {
    expect(toAboutPageContent()).toEqual(defaultAboutPageContent);
    expect(defaultAboutPageContent.sections[1]).toMatchObject({
      hidden: false,
      id: 'artists',
      title: 'ARTIST COUNCIL'
    });
  });

  it('converts a doc published before sections existed', () => {
    const content = toAboutPageContent({
      team: { board: [member] },
      vision: 'New vision'
    });

    expect(content.vision).toBe('New vision');
    expect(content.mission).toBe(defaultAboutPageContent.mission);
    expect(content.sections.map((s) => s.id)).toEqual(
      defaultAboutPageContent.sections.map((s) => s.id)
    );
    expect(content.sections[0].members).toEqual([member]);
    expect(content.sections[1]).toEqual(defaultAboutPageContent.sections[1]);
  });

  it('keeps published sections in order and drops malformed ones', () => {
    const content = toAboutPageContent({
      sections: [
        { id: 's2', members: [member], title: 'Council' },
        { id: 'bad', title: 'No members' },
        { hidden: true, id: 's1', members: [], title: 'Old' }
      ] as never
    });

    expect(content.sections).toEqual([
      { hidden: false, id: 's2', members: [member], title: 'Council' },
      { hidden: true, id: 's1', members: [], title: 'Old' }
    ]);
  });
});

describe('toCollapsibleProps', () => {
  it('leaves out hidden sections and keeps the order', () => {
    const props = toCollapsibleProps([
      { hidden: false, id: 'z', members: [member], title: 'Z' },
      { hidden: true, id: 'h', members: [], title: 'Hidden' },
      { hidden: false, id: 'a', members: [], title: 'A' }
    ]);

    expect(Object.entries(props.sectionTitles)).toEqual([
      ['z', 'Z'],
      ['a', 'A']
    ]);
    expect(Object.keys(props.subSections)).toEqual(['z', 'a']);
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
