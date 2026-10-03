import Link from 'next/link';
import { AppHeader } from '../../../../components/nutrition-intelligence/AppHeader';
import { routes } from '../../../../lib/nutrition-intelligence/routes';

/** Shown when a conversation link points to something that no longer exists. */
export default function ConversationNotFound() {
  return (
    <>
      <AppHeader variant="home" />
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
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>
          We couldn’t find that conversation
        </h1>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--ni-ink-tertiary)', maxWidth: 420 }}>
          It may have been deleted. You can find your other conversations in History, or ask something new.
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
              background: 'var(--ni-accent)',
              color: 'var(--ni-on-accent)',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Ask a question
          </Link>
          <Link
            href={routes.history}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 44,
              padding: '0 18px',
              borderRadius: 999,
              border: '1px solid var(--ni-line)',
              background: 'var(--ni-surface)',
              color: 'var(--ni-ink)',
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Open history
          </Link>
        </div>
      </main>
    </>
  );
}
