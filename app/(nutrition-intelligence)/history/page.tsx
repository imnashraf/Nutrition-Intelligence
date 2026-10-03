import type { Metadata } from 'next';
import { HistoryScreen } from '../../../components/nutrition-intelligence/history/HistoryScreen';
import { listConversations } from '../../../lib/nutrition-intelligence/client';

export const metadata: Metadata = { title: 'History' };

export default async function HistoryPage() {
  const conversations = await listConversations();
  return <HistoryScreen conversations={conversations} />;
}
