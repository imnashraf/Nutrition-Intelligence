'use client';

import { forwardRef, useState } from 'react';
import { richTextToPlain, sendFeedback } from '../../../lib/nutrition-intelligence/client';
import { TOPIC_LABELS } from '../../../lib/nutrition-intelligence/topics';
import type { Answer, Feedback, Source, Turn } from '../../../lib/nutrition-intelligence/types';
import {
  IconAlert,
  IconCheck,
  IconCopy,
  IconInfo,
  IconRetry,
  IconShare,
  IconThumbDown,
  IconThumbUp,
} from '../icons';
import { AnswerSkeleton } from './AnswerSkeleton';
import { EvidenceBadge } from './EvidenceBadge';
import { RichText } from './RichText';
import { SideNote } from './SideNote';
import styles from './answer.module.css';

interface TurnViewProps {
  turn: Turn;
  /** Prefix for section anchors (used by the contents rail). */
  anchorPrefix: string;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onCite: (n: number) => void;
  onFollowUp: (question: string) => void;
  onRetry: () => void;
}

/**
 * One question + its answer, in all states:
 * pending (05 loading), error, nutrition answer, food-safety answer.
 */
export const TurnView = forwardRef<HTMLElement, TurnViewProps>(function TurnView(
  { turn, anchorPrefix, isFirst, isLast, busy, onCite, onFollowUp, onRetry },
  ref,
) {
  const answer = turn.status === 'complete' ? turn.answer : undefined;
  const HeadingTag = isFirst ? 'h1' : 'h2';

  return (
    <article ref={ref} className={styles.turn} data-first={isFirst ? '' : undefined}>
      {/* Question */}
      <div className={styles.row} data-align="end">
        <div className={styles.question}>
          <span className={styles.kicker}>Your question</span>
          <HeadingTag className={styles.questionText}>{turn.question}</HeadingTag>
        </div>
        <div className={styles.meta}>{answer && <AnswerMeta answer={answer} />}</div>
      </div>

      {turn.status === 'pending' && (
        <div className={styles.row}>
          <AnswerSkeleton />
          <div />
        </div>
      )}

      {turn.status === 'error' && (
        <div className={styles.row}>
          <div className={styles.error} role="alert">
            <p className={styles.errorText}>{turn.error}</p>
            <button type="button" className={styles.retry} onClick={onRetry}>
              <IconRetry />
              Try again
            </button>
          </div>
          <div />
        </div>
      )}

      {answer && (
        <AnswerBody
          turnId={turn.id}
          answer={answer}
          anchorPrefix={anchorPrefix}
          isLast={isLast}
          busy={busy}
          onCite={onCite}
          onFollowUp={onFollowUp}
        />
      )}
    </article>
  );
});

function AnswerMeta({ answer }: { answer: Answer }) {
  const n = answer.sources.length;
  const note =
    answer.evidenceNote ??
    Array.from(new Set(answer.sources.map((s) => s.type.toLowerCase())))
      .slice(0, 2)
      .join(', ');
  return (
    <>
      <span className={styles.topic} data-topic={answer.topic}>
        {answer.topic === 'food-safety' && <IconAlert size={12} />}
        {TOPIC_LABELS[answer.topic]}
      </span>
      {answer.evidence && <EvidenceBadge level={answer.evidence} />}
      {n > 0 && (
        <span className={styles.metaNote}>
          {n} {n === 1 ? 'source' : 'sources'}
          {note ? ` · ${note}` : ''}
        </span>
      )}
    </>
  );
}

interface AnswerBodyProps {
  turnId: string;
  answer: Answer;
  anchorPrefix: string;
  isLast: boolean;
  busy: boolean;
  onCite: (n: number) => void;
  onFollowUp: (q: string) => void;
}

function AnswerBody({ turnId, answer, anchorPrefix, isLast, busy, onCite, onFollowUp }: AnswerBodyProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const { sources } = answer;
  const isSafety = answer.topic === 'food-safety' && !!answer.action;

  const copy = async () => {
    const text = [answer.action, answer.shortAnswer, ...answer.body]
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
      .map((t) => richTextToPlain(t))
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: 'Nutrition Intelligence', url }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(url).catch(() => {});
    }
  };

  const giveFeedback = (value: Feedback) => {
    const next = feedback === value ? null : value;
    setFeedback(next);
    void sendFeedback(turnId, next);
  };

  return (
    <div className={styles.row} data-align="start">
      <div className={styles.answerMain}>
        {/* Short answer / Do this */}
        <div id={`${anchorPrefix}-short`} data-section="short" className={styles.section}>
          {isSafety ? (
            <div className={styles.doCard}>
              <span className={styles.doLabel}>
                <IconAlert size={14} strokeWidth={2} />
                Do this
              </span>
              <p className={styles.doText}>
                <RichText nodes={answer.action!} sources={sources} onCite={onCite} />
              </p>
              <p className={styles.doSummary}>
                <RichText nodes={answer.shortAnswer} sources={sources} onCite={onCite} />
              </p>
            </div>
          ) : (
            <div className={styles.shortCard}>
              <span className={styles.shortLabel}>
                <span className={styles.shortDot} aria-hidden="true" />
                Short answer
              </span>
              <p className={styles.shortText}>
                <RichText nodes={answer.shortAnswer} sources={sources} onCite={onCite} tone="dark" emphasis="highlight" />
              </p>
            </div>
          )}
        </div>

        {/* By the numbers */}
        {answer.keyNumbers && (
          <div id={`${anchorPrefix}-numbers`} data-section="numbers" className={styles.section}>
            <div className={styles.numbersBlock}>
              <span className={styles.kicker}>By the numbers · {answer.keyNumbers.unit}</span>
              <div className={styles.numbers}>
                {answer.keyNumbers.items.map((k) => (
                  <div key={k.value} className={styles.number} data-highlight={k.highlight ? '' : undefined}>
                    <span className={styles.numberValue}>{k.value}</span>
                    <span className={styles.numberCaption}>{k.caption}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Why */}
        {answer.body.length > 0 && (
          <div id={`${anchorPrefix}-why`} data-section="why" className={styles.whyBlock}>
            <h3 className={styles.h3}>{answer.bodyTitle ?? 'Why'}</h3>
            {answer.body.map((para, i) => (
              <p key={i} className={styles.para}>
                <RichText nodes={para} sources={sources} onCite={onCite} />
              </p>
            ))}
          </div>
        )}

        {/* In practice + caveat */}
        {(answer.practice?.length || answer.caveat) && (
          <div id={`${anchorPrefix}-practice`} data-section="practice" className={styles.section}>
            <div className={styles.practice}>
              {answer.practice && answer.practice.length > 0 && (
                <>
                  <h3 className={styles.h3}>In practice</h3>
                  <dl className={styles.practiceList}>
                    {answer.practice.map((item) => (
                      <div key={item.label} className={styles.practiceRow}>
                        <dt>{item.label}</dt>
                        <dd>
                          <RichText nodes={item.content} sources={sources} onCite={onCite} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}
              {answer.caveat && (
                <div className={styles.caveat}>
                  <IconInfo className={styles.caveatIcon} />
                  <span>{answer.caveat}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions + follow-ups */}
        <div className={styles.section}>
          <div className={styles.after}>
            <div className={styles.actionsBar}>
              <div className={styles.actions}>
                <button type="button" className={styles.iconButton} onClick={copy} aria-label={copied ? 'Copied' : 'Copy answer'}>
                  {copied ? <IconCheck /> : <IconCopy />}
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => giveFeedback('helpful')}
                  aria-label="Helpful"
                  aria-pressed={feedback === 'helpful'}
                >
                  <IconThumbUp />
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => giveFeedback('not-helpful')}
                  aria-label="Not helpful"
                  aria-pressed={feedback === 'not-helpful'}
                >
                  <IconThumbDown />
                </button>
                <button type="button" className={styles.iconButton} onClick={share} aria-label="Share">
                  <IconShare />
                </button>
                <span className="ni-sr-only" aria-live="polite">
                  {copied ? 'Answer copied' : ''}
                </span>
              </div>
              {sources.length > 0 && (
                <button
                  type="button"
                  id={`${anchorPrefix}-sources`}
                  data-section="sources"
                  className={styles.allSources}
                  onClick={() => onCite(sources[0].number)}
                >
                  All {sources.length} {sources.length === 1 ? 'source' : 'sources'}
                </button>
              )}
            </div>

            {isLast && answer.followUps.length > 0 && (
              <div className={styles.followUps}>
                <span className={styles.kicker}>Ask next</span>
                <div className={styles.followList}>
                  {answer.followUps.map((q) => (
                    <button key={q} type="button" className={styles.follow} onClick={() => onFollowUp(q)} disabled={busy}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {sources.length > 0 && (
        <aside className={styles.answerSources}>
          <span className={`${styles.kicker} ${styles.marginLabel}`}>Sources</span>
          <div className={styles.notes}>
            {sources.map((s) => (
              <SideNote key={s.number} source={s} onOpen={onCite} />
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
