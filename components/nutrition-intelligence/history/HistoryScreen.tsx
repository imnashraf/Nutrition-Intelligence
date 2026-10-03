import Link from 'next/link';
import { routes } from '../../../lib/nutrition-intelligence/routes';
import type { ConversationSummary } from '../../../lib/nutrition-intelligence/types';
import { AppHeader } from '../AppHeader';
import { IconPlus } from '../icons';
import { HistoryList } from './HistoryList';
import styles from './HistoryScreen.module.css';

interface HistoryScreenProps {
  conversations: ConversationSummary[];
  accountInitials?: string;
}

/** 03 · Conversation history — full page. */
export function HistoryScreen({ conversations, accountInitials }: HistoryScreenProps) {
  return (
    <>
      <AppHeader variant="home" accountInitials={accountInitials} />
      <main className={styles.main}>
        <div className={styles.column}>
          <div className={styles.head}>
            <div className={styles.titles}>
              <p className={styles.eyebrow}>Your conversations</p>
              <h1 className={styles.title}>History</h1>
            </div>
            <Link href={routes.home} className={styles.newButton}>
              <IconPlus />
              New question
            </Link>
          </div>
          <HistoryList conversations={conversations} variant="page" />
        </div>
      </main>
    </>
  );
}
