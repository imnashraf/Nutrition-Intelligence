'use client';

import { useState } from 'react';
import { richTextToPlain, sendFeedback } from '../../../lib/nutrition-intelligence/client';
import { TOPIC_LABELS } from '../../../lib/nutrition-intelligence/topics';
import type { Answer, Feedback } from '../../../lib/nutrition-intelligence/types';
import { IconAlert, IconCheck, IconCopy, IconInfo, IconShare, IconThumbDown, IconThumbUp } from '../icons';
import { EvidenceBadge } from './EvidenceBadge';
import { RichText } from './RichText';
import styles from './answer.module.css';

interface AnswerViewProps {
  turnId: string;
  answer: Answer;
  onCite: (n: number) => void;
  onFollowUp?: (question: string) => void;
  showFollowUps?: boolean;
  followUpsDisabled?: boolean;
}

/**
 * 05 · Nutrition answer state and 06 · Food safety answer state.
 * Food-safety answers (topic === 'food-safety' with an `action`) lead with
 * an amber "Do this" card instead of the neutral short-answer card.
 */
export function AnswerView({
  turnId,
  answer,
  onCite,
  onFollowUp,
  showFollowUps = true,
  followUpsDisabled,
}: AnswerViewProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const isSafety = answer.topic === 'food-safety';
  const { sources } = answer;

  const copy = async () => {
    const text = [answer.action, answer.shortAnswer, ...answer.body]
      .filter(Boolean)
      .map((t) => richTextToPlain(t!))
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Nutrition Intelligence', url });
      } catch {
        /* user cancelled */
      }
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
    <section className={styles.answer} aria-label="Answer">
      <div className={styles.metaRow}>
        <div className={styles.metaLeft}>
          <span className={styles.topic} data-topic={answer.topic}>
            {isSafety && <IconAlert />}
            {TOPIC_LABELS[answer.topic]}
          </span>
          {answer.evidence && <EvidenceBadge level={answer.evidence} />}
        </div>
        {sources.length > 0 && (
          <span className={styles.sourceCount}>
            {sources.length} {sources.length === 1 ? 'source' : 'sources'}
          </span>
        )}
      </div>

      {isSafety && answer.action ? (
        <div className={styles.actionCard}>
          <div className={styles.actionLabel}>
            <IconAlert />
            Do this
          </div>
          <p className={styles.actionText}>
            <RichText nodes={answer.action} sources={sources} onCite={onCite} />
          </p>
          <p className={styles.actionSummary}>
            <RichText nodes={answer.shortAnswer} sources={sources} onCite={onCite} />
          </p>
        </div>
      ) : (
        <div className={styles.shortCard}>
          <div className={styles.shortLabel}>Short answer</div>
          <p className={styles.shortText}>
            <RichText nodes={answer.shortAnswer} sources={sources} onCite={onCite} />
          </p>
        </div>
      )}

      {answer.body.length > 0 && (
        <div className={styles.body}>
          {answer.body.map((para, i) => (
            <p key={i}>
              <RichText nodes={para} sources={sources} onCite={onCite} />
            </p>
          ))}
        </div>
      )}

      {answer.practice && answer.practice.length > 0 && (
        <div className={styles.practice}>
          <h3 className={styles.practiceLabel}>In practice</h3>
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
        </div>
      )}

      {answer.caveat && (
        <div className={styles.caveat}>
          <IconInfo className={styles.caveatIcon} />
          <span>{answer.caveat}</span>
        </div>
      )}

      {sources.length > 0 && (
        <div className={styles.sources}>
          <div className={styles.sourcesHead}>
            <h3 className={styles.sourcesTitle}>Sources</h3>
            <button type="button" className={styles.linkButton} onClick={() => onCite(sources[0].number)}>
              View all details
            </button>
          </div>
          <ul className={styles.sourceList}>
            {sources.map((s) => (
              <li key={s.number}>
                <button type="button" className={styles.sourceRow} onClick={() => onCite(s.number)}>
                  <span className={styles.sourceNum}>{s.number}</span>
                  <span className={styles.sourceText}>
                    <span className={styles.sourceTitle}>{s.title}</span>
                    <span className={styles.sourceSub}>
                      {[s.authors.includes(',') ? `${s.authors.split(',')[0]} et al.` : s.authors, s.publication, s.year]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  <span className={styles.sourceType}>{s.type}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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

      {showFollowUps && answer.followUps.length > 0 && onFollowUp && (
        <div className={styles.followUps}>
          <h3 className={styles.followLabel}>Keep exploring</h3>
          <div className={styles.followList}>
            {answer.followUps.map((q) => (
              <button
                key={q}
                type="button"
                className={styles.follow}
                onClick={() => onFollowUp(q)}
                disabled={followUpsDisabled}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
