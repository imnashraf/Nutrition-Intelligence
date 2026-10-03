import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ConversationScreen } from '../../../../components/nutrition-intelligence/conversation/ConversationScreen';
import { getConversation } from '../../../../lib/nutrition-intelligence/client';
import { NEW_CONVERSATION_ID, routes } from '../../../../lib/nutrition-intelligence/routes';
import type { Topic } from '../../../../lib/nutrition-intelligence/types';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ q?: string; topic?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  if (id === NEW_CONVERSATION_ID) return { title: 'New question' };
  const conversation = await getConversation(decodeURIComponent(id));
  return { title: conversation?.title ?? 'Conversation' };
}

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;

  // /c/new?q=… — a question asked from the home screen.
  if (id === NEW_CONVERSATION_ID) {
    const { q, topic } = await searchParams;
    if (!q?.trim()) redirect(routes.home);
    return (
      <ConversationScreen
        initialConversation={null}
        initialQuestion={{ question: q.trim(), topic: (topic as Topic | undefined) ?? 'any' }}
      />
    );
  }

  const conversation = await getConversation(decodeURIComponent(id));
  if (!conversation) notFound();

  return <ConversationScreen initialConversation={conversation} />;
}
