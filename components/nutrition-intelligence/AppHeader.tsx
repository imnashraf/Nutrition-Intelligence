'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { routes } from '../../lib/nutrition-intelligence/routes';
import { IconClock, IconPlus, LogoMark } from './icons';
import { HistoryPanel } from './panels/HistoryPanel';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  /** `home`: open, borderless. `conversation`: sticky with thread title. */
  variant: 'home' | 'conversation';
  title?: string;
  activeConversationId?: string;
  /** Initials for the account button. Omit to hide it (e.g. signed out). */
  accountInitials?: string;
  /** Where the account button goes in your app. */
  accountHref?: string;
}

export function AppHeader({
  variant,
  title,
  activeConversationId,
  accountInitials,
  accountHref = '#',
}: AppHeaderProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const closeHistory = useCallback(() => setHistoryOpen(false), []);

  return (
    <>
      <header className={styles.header} data-variant={variant}>
        <div className={styles.left}>
          <Link href={routes.home} className={styles.brand} aria-label="Nutrition Intelligence home">
            <LogoMark className={styles.mark} />
            <span className={styles.wordmark} data-collapse={variant === 'conversation' ? '' : undefined}>
              Nutrition Intelligence
            </span>
          </Link>
          {variant === 'conversation' && title && (
            <>
              <span className={styles.divider} aria-hidden="true" />
              <span className={styles.title}>{title}</span>
            </>
          )}
        </div>

        <nav className={styles.nav} aria-label="Main">
          <button
            type="button"
            className={styles.ghost}
            onClick={() => setHistoryOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={historyOpen}
          >
            <IconClock />
            <span className={styles.label}>History</span>
          </button>

          {variant === 'conversation' && (
            <Link href={routes.home} className={styles.outline} aria-label="New conversation">
              <IconPlus />
              <span className={styles.label}>New</span>
            </Link>
          )}

          {variant === 'home' && accountInitials && (
            <Link href={accountHref} className={styles.avatar} aria-label="Account">
              {accountInitials}
            </Link>
          )}
        </nav>
      </header>

      <HistoryPanel open={historyOpen} onClose={closeHistory} activeConversationId={activeConversationId} />
    </>
  );
}
