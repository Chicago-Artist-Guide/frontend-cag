import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..');

const readSource = (relativePath: string) =>
  fs.readFileSync(path.resolve(repoRoot, relativePath), 'utf8');

describe('Messaging: apply-to-artist thread bugs', () => {
  describe('Full message is displayed when a thread is selected', () => {
    it('loads messages with sender/recipient + thread_id queries that match rules and indexes', () => {
      const src = readSource('context/MessageContext.tsx');
      expect(src).toMatch(/where\('sender_id'/);
      expect(src).toMatch(/where\('recipient_id'/);
      expect(src).toMatch(/where\('thread_id'/);
      expect(src).not.toMatch(/where\('sender_id', 'in'/);
      expect(src).toMatch(/if \(!accountId\) \{\s*return;/s);
    });

    it('lists legacy uid-keyed threads in a separate query so a rules miss cannot empty the inbox', () => {
      const src = readSource('context/MessageContext.tsx');
      expect(src).toMatch(/fetchThreadsForAccountRef/);
      expect(src).toMatch(/accountUid && accountUid !== accountId/);
      expect(src).toMatch(/Could not load legacy uid-keyed threads/);
    });

    it('lets thread participants read messages so a thread_id query is allowed', () => {
      const src = readSource('../firestore.rules');
      expect(src).toMatch(/function isMessageThreadParticipant/);
      expect(src).toMatch(/isMessageThreadParticipant\(messageData\)/);
    });

    it('keeps the Firestore document id on thread objects (id wins over spread)', () => {
      const src = readSource('context/MessageContext.tsx');
      expect(src).toMatch(/\.\.\.threadDoc\.data\(\),\s*id:\s*threadDoc\.id/s);
      expect(src).toMatch(
        /\.\.\.threadSnapshot\.data\(\),\s*id:\s*threadSnapshot\.id/s
      );
    });

    it('opens a selected thread from the already-loaded list', () => {
      const src = readSource('components/Messages/MessagesContainer.tsx');
      expect(src).toMatch(/threads\.find/);
      expect(src).toMatch(/onThreadSelect/);
    });

    it('makes thread rows a clickable button that passes thread.id', () => {
      const src = readSource('components/Messages/MessageThreads.tsx');
      expect(src).toMatch(/<button/);
      expect(src).toMatch(/onClick=\{\(\) => onThreadSelect\(thread\.id\)\}/);
    });
  });

  describe('Theatre company name is resolved for talent', () => {
    it('looks up the company account by document id with uid fallback and theatre_name', () => {
      const src = readSource('components/Profile/shared/api.ts');
      expect(src).toMatch(/export const getTheaterNameForAccount/);
      expect(src).toMatch(/getAccountWithAccountId/);
      expect(src).toMatch(/getProfileWithUid/);
      expect(src).toMatch(/theatre_name/);
      expect(src).toMatch(/theater_name/);
    });
  });

  describe('Message preview does not begin with Email sent', () => {
    it('uses getConversationPreview for the thread list and the full thread', () => {
      const listSrc = readSource('components/Messages/MessageThreads.tsx');
      const threadSrc = readSource('components/Messages/MessageThread.tsx');
      const helperSrc = readSource('components/Messages/messages.ts');

      expect(helperSrc).toMatch(/Email sent:/);
      expect(listSrc).toMatch(
        /getConversationPreview\(thread\.last_message\?\.content\)/
      );
      expect(threadSrc).toMatch(/getConversationPreview\(msg\.content\)/);
    });
  });

  describe('Invitation email does not duplicate or use the talent name as the company', () => {
    it('does not pass recipientName into theater-to-artist email copy', () => {
      const threadSrc = readSource('components/Messages/MessageThread.tsx');
      expect(threadSrc).not.toMatch(
        /theaterToArtistEmail(Text|Html)\(\s*recipientName/
      );
      expect(threadSrc).toMatch(/getMatchInvitationSenderName/);
      expect(threadSrc).toMatch(/shouldSendMatchInvitationFollowUp/);
      expect(threadSrc).toMatch(/isMatchInitiator/);
    });

    it('resolves the company name for Apply emails instead of only theatre_name', () => {
      const src = readSource('components/Matches/TalentMatchCard.tsx');
      expect(src).toMatch(/resolveTheaterDisplayName/);
      expect(src).toMatch(/theaterToArtistEmailText\(\s*theaterName/);
    });
  });

  describe('Artist Apply keys the theatre by account document id', () => {
    it('does not pass production.account_id (auth uid) into the message thread', () => {
      const src = readSource('components/Matches/CompanyMatchCard.tsx');
      expect(src).toMatch(/theater\.account_id/);
      expect(src).not.toMatch(
        /const theaterAccountId = production\?\.account_id/
      );
    });

    it('collapses uid-keyed and doc-id-keyed threads for the same pair', () => {
      const src = readSource('components/Messages/api.ts');
      expect(src).toMatch(/export const collapseDuplicateThreads/);
      expect(src).toMatch(/mergedFromThreadIds/);
      expect(src).toMatch(/resolveAccountIdentity/);
    });

    it('loads messages from merged duplicate thread ids', () => {
      const contextSrc = readSource('context/MessageContext.tsx');
      const threadSrc = readSource('components/Messages/MessageThread.tsx');
      expect(contextSrc).toMatch(/additionalThreadIds/);
      expect(contextSrc).toMatch(/collapseDuplicateThreads/);
      expect(threadSrc).toMatch(/thread\.mergedFromThreadIds/);
    });

    it('treats accounts/{authUid} as a theatre participant in rules', () => {
      const src = readSource('../firestore.rules');
      expect(src).toMatch(/function accountRefBelongsToUser/);
      expect(src).toMatch(/exists\(accountRef\)/);
      expect(src).toMatch(/documents\/accounts\/\$\(request\.auth\.uid\)/);
    });
  });
});
