'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { askQuestion } from '../../../lib/nutrition-intelligence/client';
import { routes } from '../../../lib/nutrition-intelligence/routes';
import type { Conversation, Topic, Turn } from '../../../lib/nutrition-intelligence/types';
import { AppHeader } from '../AppHeader';
import { Composer } from '../Composer';
import { SourcePanel } from '../panels/SourcePanel';
import { TurnView } from './TurnView';
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
  const [turns, setTurns] = useState<Turn[]>(initialConversation?.turns ?? []);
  const [source, setSource] = useState<SourceState>(null);
  const [activeSection, setActiveSection] = useState('short');
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

  // The contents rail follows the latest answer.
  const latest = turns[turns.length - 1];
  const latestAnswer = latest?.status === 'complete' ? latest.answer : undefined;
  const anchor = (turnId: string) => `ni-${turnId}`;

  const rail = latestAnswer
    ? [
        { key: 'short', label: latestAnswer.action ? 'Do this' : 'Short answer' },
        latestAnswer.keyNumbers && { key: 'numbers', label: 'By the numbers' },
        latestAnswer.body.length > 0 && { key: 'why', label: 'Why' },
        (latestAnswer.practice?.length || latestAnswer.caveat) && { key: 'practice', label: 'In practice' },
        latestAnswer.sources.length > 0 && { key: 'sources', label: 'Sources' },
      ].filter((x): x is { key: string; label: string } => Boolean(x))
    : [];

  // Highlight the rail item for the section currently in view.
  useEffect(() => {
    if (!latest || !latestAnswer) return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(`[id^="${anchor(latest.id)}-"][data-section]`),
    );
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.getAttribute('data-section') ?? 'short');
      },
      { rootMargin: '-90px 0px -60% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [latest, latestAnswer]);

  const closeSources = useCallback(() => setSource(null), []);
  const activeSources = source ? turns.find((t) => t.id === source.turnId)?.answer?.sources ?? [] : [];

  return (
    <>
      <AppHeader variant="app" />

      <div className={styles.shell}>
        <aside className={styles.rail} aria-label="On this answer">
          {rail.length > 0 && (
            <>
              <span className={styles.railLabel}>On this answer</span>
              <nav className={styles.railNav}>
                {rail.map((item) => (
                  <a
                    key={item.key}
                    href={`#${anchor(latest!.id)}-${item.key}`}
                    className={styles.railLink}
                    aria-current={activeSection === item.key ? 'location' : undefined}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </>
          )}
          {turns.length > 1 && (
            <>
              <span className={`${styles.railLabel} ${styles.railLabelGap}`}>In this conversation</span>
              <ol className={styles.railTurns}>
                {turns.map((t, i) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      className={styles.railTurn}
                      onClick={() => turnRefs.current.get(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    >
                      <span className={styles.railTurnNum}>{String(i + 1).padStart(2, '0')}</span>
                      <span className={styles.railTurnText}>{t.question}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </aside>

        <main className={styles.thread}>
          {turns.map((turn, index) => (
            <TurnView
              key={turn.id}
              ref={(el) => {
                if (el) turnRefs.current.set(turn.id, el);
                else turnRefs.current.delete(turn.id);
              }}
              turn={turn}
              anchorPrefix={anchor(turn.id)}
              isFirst={index === 0}
              isLast={index === turns.length - 1}
              busy={busy}
              onCite={(number) => setSource({ turnId: turn.id, number })}
              onFollowUp={(q) => ask(q)}
              onRetry={() => ask(turn.question, undefined, turn.id)}
            />
          ))}
        </main>
      </div>

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
