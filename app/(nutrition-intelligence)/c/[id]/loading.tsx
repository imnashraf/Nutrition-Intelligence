import { AnswerSkeleton } from '../../../../components/nutrition-intelligence/conversation/AnswerSkeleton';

/** Shown while a stored conversation loads from the server. */
export default function Loading() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: 'clamp(96px, 10vw, 128px) var(--ni-gutter) 32px' }}>
      <div style={{ width: '100%', maxWidth: 'var(--ni-measure)' }}>
        <AnswerSkeleton />
      </div>
    </main>
  );
}
