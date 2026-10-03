'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { askQuestion } from '../../../lib/nutrition-intelligence/client';
import { routes } from '../../../lib/nutrition-intelligence/routes';
import type { Conversation, Topic, Turn } from '../../../lib/nutrition-intelligence/types';
import { AppHeader } from '../AppHeader';
import { Composer } from '../Composer';
import { IconRetry } from '../icons';
import { SourcePanel } from '../panels/SourcePanel';
import { AnswerSkeleton } from './AnswerSkeleton';
import { AnswerView } from './AnswerView';
import answerStyles from './answer.module.css';
import styles from './ConversationScreen.module.css';

interface ConversationScreenProps {
  /** Existing conversation, or null when starting a new one. */
  initialConversation: Conversation | null;
  /** Question to ask immediately (new conversation from the home screen). */
  initialQuestion?: { question: string; topic?: Topic | 'any' };
}

type SourceState = { turnId: string; number: number } | null;

/** 02 · Conversation — with loading, error, nutrition and food-safety answer states. */
export function ConversationScreen({ initialConversation, initialQuestion }: ConversationScreenProps) {
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversation?.id);
  const [title, setTitle] = useState(initialConversation?.title ?? initialQuestion?.question ?? 'New conversation');
  const [turns, setTurns] = useState<Turn[]>(initialConversation?.turns ?? []);
  const [source, setSource] = useState<SourceState>(null);
  const turnRefs = useRef(new Map<string, HTMLElement>());
  const scrollTarget = useRef<string | null>(null);
  const started = useRef(false);

  const busy = turns.some((t) => t.status === 'pending');

  const ask = useCallback(
    async (question: string, topic?: Topic | 'any', replaceTurnId?: string) => {
      const pendingId = replaceTurnId ?? `pending-${Date.now()}`;
      const pending: Turn = { id: pendingId, question, askedAt: new Date().toISOString(), status: 'pending' };
      scrollTarget.current = pendingId;
      setTurns((prev) =>
        replaceTurnId ? prev.map((t) => (t.id === replaceTurnId ? pending : t)) : [...prev, pending],
      );

      try {
        const result = await askQuestion({ question, topic, conversationId });
        setTurns((prev) => prev.map((t) => (t.id === pendingId ? result.turn : t)));
        if (!conversationId) {
          setConversationId(result.conversationId);
          // Update the address bar without re-rendering the page on the server.
          window.history.replaceState(null, '', routes.conversation(result.conversationId));
        }
      } catch {
        setTurns((prev) =>
          prev.map((t) =>
            t.id === pendingId
              ? { ...t, status: 'error', error: 'We couldn’t answer that just now. Please try again.' }
              : t,
          ),
        );
      }
    },
    [conversationId],
  );

  // New conversation started from the home screen.
  useEffect(() => {
    if (started.current || !initialQuestion) return;
    started.current = true;
    setTitle(initialQuestion.question);
    void ask(initialQuestion.question, initialQuestion.topic);
  }, [initialQuestion, ask]);

  // Bring a newly added turn into view.
  useEffect(() => {
    const id = scrollTarget.current;
    if (!id) return;
    const el = turnRefs.current.get(id);
    if (el && turns.length > 1) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    scrollTarget.current = null;
  }, [turns]);

  const closeSources = useCallback(() => setSource(null), []);
  const activeSources = source ? turns.find((t) => t.id === source.turnId)?.answer?.sources ?? [] : [];

  return (
    <>
      <AppHeader variant="conversation" title={title} activeConversationId={conversationId} />

      <main className={styles.main}>
        <div className={styles.thread}>
          {turns.map((turn, index) => {
            const isLast = index === turns.length - 1;
            return (
              <article
                key={turn.id}
                className={answerStyles.turn}
                ref={(el) => {
                  if (el) turnRefs.current.set(turn.id, el);
                  else turnRefs.current.delete(turn.id);
                }}
              >
                <section className={answerStyles.question} aria-label="Your question">
                  <span className={answerStyles.questionLabel}>You asked</span>
                  <p className={answerStyles.questionText}>{turn.question}</p>
                </section>

                {turn.status === 'pending' && <AnswerSkeleton />}

                {turn.status === 'error' && (
                  <div className={answerStyles.error} role="alert">
                    <p className={answerStyles.errorText}>{turn.error}</p>
                    <button type="button" className={answerStyles.retry} onClick={() => ask(turn.question, undefined, turn.id)}>
                      <IconRetry />
                      Try again
                    </button>
                  </div>
                )}

                {turn.status === 'complete' && turn.answer && (
                  <AnswerView
                    turnId={turn.id}
                    answer={turn.answer}
                    onCite={(number) => setSource({ turnId: turn.id, number })}
                    onFollowUp={(q) => ask(q)}
                    showFollowUps={isLast}
                    followUpsDisabled={busy}
                  />
                )}
              </article>
            );
          })}
        </div>
      </main>

      <div className={styles.dock}>
        <Composer variant="dock" onSubmit={(q) => ask(q)} busy={busy} />
      </div>

      <SourcePanel
        open={source !== null && activeSources.length > 0}
        onClose={closeSources}
        sources={activeSources}
        activeNumber={source?.number ?? 1}
        onSelect={(number) => setSource((s) => (s ? { ...s, number } : s))}
      />
    </>
  );
}
