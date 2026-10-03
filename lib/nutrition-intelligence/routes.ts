/**
 * Every URL the Nutrition Intelligence UI links to lives here.
 * Change these if the screens should mount under a different path.
 */
export const routes = {
  home: '/',
  history: '/history',
  conversation: (id: string) => `/c/${encodeURIComponent(id)}`,
  /** A new conversation started from the home screen. */
  newConversation: (question: string, topic?: string) => {
    const params = new URLSearchParams({ q: question });
    if (topic && topic !== 'any') params.set('topic', topic);
    return `/c/new?${params.toString()}`;
  },
} as const;

export const NEW_CONVERSATION_ID = 'new';
