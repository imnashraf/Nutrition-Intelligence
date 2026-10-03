import type { Metadata } from 'next';
import { HistoryScreen } from '../../../components/nutrition-intelligence/history/HistoryScreen';
import { listConversations } from '../../../lib/nutrition-intelligence/client';
import { SAMPLE_ACCOUNT_INITIALS } from '../../../lib/nutrition-intelligence/mock-data';

export const metadata: Metadata = { title: 'History' };

export default async function HistoryPage() {
  const conversations = await listConversations();
  return <HistoryScreen conversations={conversations} accountInitials={SAMPLE_ACCOUNT_INITIALS} />;
}
