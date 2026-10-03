'use client';

import { useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { TOPIC_OPTIONS } from '../../lib/nutrition-intelligence/topics';
import type { Topic } from '../../lib/nutrition-intelligence/types';
import { IconArrowUp, IconChevronDown, IconTarget } from './icons';
import styles from './Composer.module.css';

interface ComposerProps {
  /** `hero`: large card on the home screen. `dock`: follow-up bar in a conversation. */
  variant: 'hero' | 'dock';
  onSubmit: (question: string, topic: Topic | 'any') => void;
  busy?: boolean;
  placeholder?: string;
  label?: string;
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
  placeholder = variant === 'hero' ? 'Ask about nutrition, diets or food safety…' : 'Ask a follow-up…',
  label = variant === 'hero' ? 'Your question' : 'Ask a follow-up',
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
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value]);

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

  const textarea = (
    <>
      <label htmlFor={`${id}-q`} className="ni-sr-only">
        {label}
      </label>
      <textarea
        id={`${id}-q`}
        ref={ref}
        rows={variant === 'hero' ? 2 : 1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={styles.input}
        autoFocus={autoFocus}
        enterKeyHint="send"
      />
    </>
  );

  const send = (
    <button type="submit" className={styles.send} aria-label="Ask" disabled={!canSend} data-busy={busy || undefined}>
      {busy ? <span className={styles.spinner} aria-hidden="true" /> : <IconArrowUp />}
    </button>
  );

  if (variant === 'dock') {
    return (
      <form className={styles.dock} onSubmit={submit}>
        <div className={styles.dockBar}>
          {textarea}
          {send}
        </div>
        <p className={styles.note}>General information, not personal medical advice.</p>
      </form>
    );
  }

  return (
    <form className={styles.hero} onSubmit={submit}>
      {textarea}
      <div className={styles.row}>
        <div className={styles.topic}>
          <IconTarget className={styles.topicIcon} />
          <label htmlFor={`${id}-t`} className="ni-sr-only">
            Topic
          </label>
          <select
            id={`${id}-t`}
            value={topic}
            onChange={(e) => setTopic(e.target.value as Topic | 'any')}
            className={styles.select}
          >
            {TOPIC_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <IconChevronDown className={styles.chevron} />
        </div>
        {send}
      </div>
    </form>
  );
}
