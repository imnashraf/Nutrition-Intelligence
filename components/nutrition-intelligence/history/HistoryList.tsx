'use client';

import Link from 'next/link';
import { useMemo, useState, useSyncExternalStore } from 'react';
import type { ConversationSummary } from '../../../lib/nutrition-intelligence/types';
import { routes } from '../../../lib/nutrition-intelligence/routes';
import { TOPIC_LABELS } from '../../../lib/nutrition-intelligence/topics';
import { IconSearch } from '../icons';
import styles from './HistoryList.module.css';

interface HistoryListProps {
  conversations: ConversationSummary[];
  activeId?: string;
  variant?: 'panel' | 'page';
  /** Called when an item is chosen (e.g. to close the panel). */
  onNavigate?: () => void;
  autoFocusSearch?: boolean;
}

type Group = { label: string; items: ConversationSummary[] };

const DAY = 24 * 60 * 60 * 1000;
const subscribeNoop = () => () => {};

function groupByDate(items: ConversationSummary[], now: Date): Group[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const groups: Group[] = [
    { label: 'Today', items: [] },
    { label: 'Previous 7 days', items: [] },
    { label: 'Earlier', items: [] },
  ];
  for (const item of items) {
    const t = new Date(item.updatedAt).getTime();
    if (t >= startOfToday) groups[0].items.push(item);
    else if (t >= startOfToday - 7 * DAY) groups[1].items.push(item);
    else groups[2].items.push(item);
  }
  return groups.filter((g) => g.items.length > 0);
}

function formatTime(iso: string, now: Date) {
  const d = new Date(iso);
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function HistoryList({
  conversations,
  activeId,
  variant = 'panel',
  onNavigate,
  autoFocusSearch,
}: HistoryListProps) {
  const [query, setQuery] = useState('');
  // Dates depend on the viewer's clock and time zone, so they render after mount
  // (avoids a server/client hydration mismatch).
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const now = useMemo(() => (isClient ? new Date() : null), [isClient]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q),
    );
  }, [conversations, query]);

  const groups = now ? groupByDate(filtered, now) : [{ label: '', items: filtered }];

  if (conversations.length === 0) {
    return (
      <div className={styles.empty} data-variant={variant}>
        <p className={styles.emptyTitle}>No conversations yet</p>
        <p className={styles.emptyBody}>Questions you ask will appear here, so you can come back to them.</p>
        <Link href={routes.home} className={styles.emptyAction} onClick={onNavigate}>
          Ask a question
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.root} data-variant={variant}>
      <div className={styles.search}>
        <label htmlFor={`ni-history-search-${variant}`} className="ni-sr-only">
          Search conversations
        </label>
        <IconSearch className={styles.searchIcon} />
        <input
          id={`ni-history-search-${variant}`}
          type="search"
          placeholder="Search conversations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
          autoComplete="off"
          data-autofocus={autoFocusSearch ? '' : undefined}
        />
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty} data-variant={variant}>
          <p className={styles.emptyTitle}>Nothing matches “{query.trim()}”</p>
          <p className={styles.emptyBody}>Try a different word, or clear the search to see everything.</p>
          <button type="button" className={styles.emptyAction} onClick={() => setQuery('')}>
            Clear search
          </button>
        </div>
      ) : (
        <div className={styles.groups}>
          {groups.map((group) => (
            <section key={group.label || 'all'} className={styles.group} aria-label={group.label || 'Conversations'}>
              {group.label && <h3 className={styles.groupLabel}>{group.label}</h3>}
              <ul className={styles.list}>
                {group.items.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={routes.conversation(c.id)}
                      className={styles.item}
                      aria-current={c.id === activeId ? 'page' : undefined}
                      onClick={onNavigate}
                    >
                      <span className={styles.itemTop}>
                        <span className={styles.itemTitle}>{c.title}</span>
                        <time className={styles.itemTime} dateTime={c.updatedAt}>
                          {now ? formatTime(c.updatedAt, now) : ''}
                        </time>
                      </span>
                      {c.preview && <span className={styles.itemPreview}>{c.preview}</span>}
                      <span className={styles.itemTopic} data-topic={c.topic}>
                        {TOPIC_LABELS[c.topic]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
