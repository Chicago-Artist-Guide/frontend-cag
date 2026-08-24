import { getConversationPreview } from './messages';

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
