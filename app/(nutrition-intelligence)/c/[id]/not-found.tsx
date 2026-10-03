import Link from 'next/link';
import { AppHeader } from '../../../../components/nutrition-intelligence/AppHeader';
import { routes } from '../../../../lib/nutrition-intelligence/routes';

/** Shown when a conversation link points to something that no longer exists. */
export default function ConversationNotFound() {
  return (
    <>
      <AppHeader variant="app" />
      <main
        style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '64px var(--ni-gutter)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontFamily: 'var(--ni-font-serif)', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
          We couldn’t find that conversation
        </h1>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--ni-ink-tertiary)', maxWidth: 420 }}>
          It may have been deleted. Ask your question again to get a fresh answer.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href={routes.home}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 44,
              padding: '0 18px',
              borderRadius: 999,
              background: 'var(--ni-forest)',
              color: 'var(--ni-on-forest-strong)',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Ask a question
          </Link>
        </div>
      </main>
    </>
  );
}
