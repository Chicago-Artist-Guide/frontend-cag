import {
  getConversationPreview,
  getMatchInvitationSenderName,
  resolveArtistDisplayName,
  resolveTheaterDisplayName,
  shouldSendMatchInvitationFollowUp,
  theaterToArtistEmailText
} from './messages';

describe('getConversationPreview', () => {
  it('strips a leading "Email sent:" prefix from thread previews', () => {
    expect(
      getConversationPreview(
        "Email sent: We're interested in you for Hamlet in Hamlet."
      )
    ).toBe("We're interested in you for Hamlet in Hamlet.");
  });

  it('is case-insensitive and trims leftover whitespace', () => {
    expect(getConversationPreview('EMAIL SENT:   Hello there')).toBe(
      'Hello there'
    );
  });

  it('leaves ordinary conversation copy unchanged', () => {
    expect(
      getConversationPreview(
        "We're interested in you for Hamlet in Hamlet. Please provide your availability to audition by emailing a@b.com."
      )
    ).toBe(
      "We're interested in you for Hamlet in Hamlet. Please provide your availability to audition by emailing a@b.com."
    );
  });

  it('returns an empty string for missing or prefix-only content', () => {
    expect(getConversationPreview(undefined)).toBe('');
    expect(getConversationPreview(null)).toBe('');
    expect(getConversationPreview('Email sent:')).toBe('');
  });
});

describe('match invitation email sender', () => {
  it('uses the theatre company name, not the talent name, for theater-to-artist copy', () => {
    expect(
      getMatchInvitationSenderName(
        'theater',
        'Simple Theatre',
        'Michelle Benda'
      )
    ).toBe('Simple Theatre');
    expect(
      theaterToArtistEmailText(
        getMatchInvitationSenderName(
          'theater',
          'Simple Theatre',
          'Michelle Benda'
        ),
        'Stage Management',
        "J'UNCLE",
        'jonathanlthomas14@gmail.com'
      )
    ).toContain('We are Simple Theatre');
    expect(
      theaterToArtistEmailText(
        getMatchInvitationSenderName(
          'theater',
          'Simple Theatre',
          'Michelle Benda'
        ),
        'Stage Management',
        "J'UNCLE",
        'jonathanlthomas14@gmail.com'
      )
    ).not.toContain('Michelle Benda');
  });

  it('uses the artist name for artist-to-theater copy', () => {
    expect(
      getMatchInvitationSenderName('talent', 'Simple Theatre', 'Michelle Benda')
    ).toBe('Michelle Benda');
  });

  it('prefers profile theatre_name then account theater_name', () => {
    expect(
      resolveTheaterDisplayName(
        { theatre_name: 'Simple Theatre' },
        { theater_name: 'Wrong' }
      )
    ).toBe('Simple Theatre');
    expect(
      resolveTheaterDisplayName({}, { theater_name: 'Simple Theatre' })
    ).toBe('Simple Theatre');
    expect(resolveTheaterDisplayName({}, {})).toBe('Theatre');
  });

  it('builds the artist display name from first and last name', () => {
    expect(
      resolveArtistDisplayName({ first_name: 'Michelle', last_name: 'Benda' })
    ).toBe('Michelle Benda');
  });

  it('does not send a second invitation email when the initiator accepts their own match', () => {
    expect(shouldSendMatchInvitationFollowUp('theater', 'theater')).toBe(false);
    expect(shouldSendMatchInvitationFollowUp('theater', 'talent')).toBe(true);
    expect(shouldSendMatchInvitationFollowUp('talent', 'theater')).toBe(true);
  });
});
