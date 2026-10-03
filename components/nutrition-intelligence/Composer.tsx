'use client';

import { useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { TOPIC_OPTIONS } from '../../lib/nutrition-intelligence/topics';
import type { Topic } from '../../lib/nutrition-intelligence/types';
import { IconArrowRight } from './icons';
import styles from './Composer.module.css';

interface ComposerProps {
  /** `hero`: large card in the home hero. `dock`: dark follow-up bar in a conversation. */
  variant: 'hero' | 'dock';
  onSubmit: (question: string, topic: Topic | 'any') => void;
  busy?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Question input. Enter sends, Shift+Enter adds a new line.
 * The textarea grows with its content up to a max height.
 */
export function Composer({
  variant,
  onSubmit,
  busy = false,
  placeholder = variant === 'hero' ? 'e.g. Is oat milk as nutritious as dairy milk?' : 'Ask a follow-up…',
  autoFocus,
}: ComposerProps) {
  const id = useId();
  const [value, setValue] = useState('');
  const [topic, setTopic] = useState<Topic | 'any'>('any');
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, variant === 'hero' ? 240 : 180)}px`;
  }, [value, variant]);

  const canSend = value.trim().length > 0 && !busy;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    onSubmit(value.trim(), topic);
    setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const send = (
    <button type="submit" className={styles.send} aria-label="Ask" disabled={!canSend} data-busy={busy || undefined}>
      {busy ? <span className={styles.spinner} aria-hidden="true" /> : <IconArrowRight />}
    </button>
  );

  if (variant === 'dock') {
    return (
      <form className={styles.dock} onSubmit={submit}>
        <div className={styles.dockBar}>
          <label htmlFor={`${id}-q`} className="ni-sr-only">
            Ask a follow-up
          </label>
          <textarea
            id={`${id}-q`}
            ref={ref}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className={styles.dockInput}
            autoFocus={autoFocus}
            enterKeyHint="send"
          />
          {send}
        </div>
        <p className={styles.note}>General information, not personal medical advice.</p>
      </form>
    );
  }

  return (
    <form className={styles.hero} onSubmit={submit}>
      <label htmlFor={`${id}-q`} className={styles.label}>
        Your question
      </label>
      <textarea
        id={`${id}-q`}
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={styles.heroInput}
        autoFocus={autoFocus}
        enterKeyHint="send"
      />
      <div className={styles.row}>
        <div role="group" aria-label="Topic" className={styles.topics}>
          {TOPIC_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className={styles.topic}
              aria-pressed={topic === o.value}
              onClick={() => setTopic(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
        {send}
      </div>
    </form>
  );
}
