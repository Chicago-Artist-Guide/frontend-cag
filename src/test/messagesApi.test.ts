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
import { MessageThreadType } from '../components/Messages/types';

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

describe('collapseDuplicateThreads', () => {
  it('keeps a single thread unchanged', () => {
    const threads = [
      {
        id: 'thread-1',
        theater_account_id: 'theater-doc',
        talent_account_id: 'talent-doc',
        updated_at: { seconds: 1 }
      }
    ] as unknown as MessageThreadType[];

    expect(messagesApi.collapseDuplicateThreads(threads, (id) => id)).toEqual(
      threads
    );
  });

  it('merges uid-keyed and doc-id-keyed threads for the same pair', () => {
    const threads = [
      {
        id: 'apply-thread',
        theater_account_id: 'theater-uid',
        talent_account_id: 'talent-doc',
        last_message: { content: 'I applied' },
        updated_at: { seconds: 1 },
        production_id: 'prod-1',
        role_id: 'role-1'
      },
      {
        id: 'accept-thread',
        theater_account_id: 'theater-doc',
        talent_account_id: 'talent-doc',
        last_message: { content: 'We are interested' },
        updated_at: { seconds: 2 }
      }
    ] as unknown as MessageThreadType[];

    const collapsed = messagesApi.collapseDuplicateThreads(threads, (id) =>
      id === 'theater-uid' ? 'theater-doc' : id
    );

    expect(collapsed).toHaveLength(1);
    expect(collapsed[0].id).toBe('accept-thread');
    expect(collapsed[0].last_message?.content).toBe('We are interested');
    expect(collapsed[0].mergedFromThreadIds).toEqual(['apply-thread']);
    expect(collapsed[0].production_id).toBe('prod-1');
  });
});
