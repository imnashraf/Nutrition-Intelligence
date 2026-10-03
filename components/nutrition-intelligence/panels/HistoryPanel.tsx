'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listConversations } from '../../../lib/nutrition-intelligence/client';
import { routes } from '../../../lib/nutrition-intelligence/routes';
import type { ConversationSummary } from '../../../lib/nutrition-intelligence/types';
import { HistoryList } from '../history/HistoryList';
import { IconClose } from '../icons';
import { Drawer } from './Drawer';
import styles from './panel.module.css';

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
  activeConversationId?: string;
}

/** 03 · Conversation history — slide-over version, opened from the header. */
export function HistoryPanel({ open, onClose, activeConversationId }: HistoryPanelProps) {
  const [items, setItems] = useState<ConversationSummary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listConversations()
      .then((data) => {
        if (cancelled) return;
        setFailed(false);
        setItems(data);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <Drawer open={open} onClose={onClose} side="left" labelledBy="ni-history-title">
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 id="ni-history-title" className={styles.title}>
            History
          </h2>
        </div>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close history">
          <IconClose />
        </button>
      </div>

      <div className={styles.body}>
        {failed ? (
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--ni-ink-tertiary)' }}>
            Your history couldn’t load just now. Close this panel and try again in a moment.
          </p>
        ) : items === null ? (
          <div className={styles.loading} aria-label="Loading history" role="status">
            <div className={styles.loadingRow} />
            <div className={styles.loadingRow} />
            <div className={styles.loadingRow} />
          </div>
        ) : (
          <HistoryList
            conversations={items}
            activeId={activeConversationId}
            variant="panel"
            onNavigate={onClose}
            autoFocusSearch
          />
        )}
      </div>

      <div className={styles.footer}>
        <Link href={routes.history} className={styles.footerLink} onClick={onClose}>
          Open full history
        </Link>
      </div>
    </Drawer>
  );
}
