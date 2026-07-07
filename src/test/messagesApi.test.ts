import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();

vi.mock('firebase/firestore', async () => {
  const actual =
    await vi.importActual<typeof import('firebase/firestore')>(
      'firebase/firestore'
    );

  return {
    ...actual,
    addDoc: (...args: unknown[]) => mockAddDoc(...args),
    collection: vi.fn(() => 'messages-collection'),
    doc: vi.fn((_store, collectionName, id) => `${collectionName}/${id}`),
    getDocs: vi.fn(),
    updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
    Timestamp: {
      now: vi.fn(() => ({ seconds: 1 }))
    }
  };
});

import * as messagesApi from '../components/Messages/api';
import {
  stripEmailCtas,
  theaterToArtistEmailText,
  theaterToArtistMessage
} from '../components/Messages/messages';

describe('stripEmailCtas', () => {
  it('removes login-to-messages CTA from email text', () => {
    const emailText = theaterToArtistEmailText(
      'Demo Theatre',
      'Lead',
      'Summer Show',
      'contact@example.com'
    );

    expect(emailText).toContain('login to CAG');
    expect(stripEmailCtas(emailText)).not.toContain('login to CAG');
    expect(stripEmailCtas(emailText)).toContain('Demo Theatre');
  });

  it('leaves short in-app messages unchanged when they have no CTA', () => {
    const shortMessage = theaterToArtistMessage(
      'Lead',
      'Summer Show',
      'contact@example.com'
    );

    expect(stripEmailCtas(shortMessage)).toBe(shortMessage);
  });
});

describe('appendEmailSentMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddDoc.mockResolvedValue({ id: 'message-2' });
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  it('updates the thread preview with an Email Sent prefix', async () => {
    const emailText = theaterToArtistEmailText(
      'Demo Theatre',
      'Lead',
      'Summer Show',
      'contact@example.com'
    );

    await messagesApi.appendEmailSentMessage(
      {} as any,
      'thread-1',
      'theater-1',
      'talent-1',
      'theater',
      emailText
    );

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      'threads/thread-1',
      expect.objectContaining({
        last_message: expect.objectContaining({
          content: expect.stringMatching(/^Email Sent:/)
        })
      })
    );
  });
});
