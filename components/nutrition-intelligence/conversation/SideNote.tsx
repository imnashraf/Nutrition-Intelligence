import type { Source } from '../../../lib/nutrition-intelligence/types';
import styles from './answer.module.css';

/** "Morton RW, Murphy KT, …" → "Morton et al."; two authors → "Schoenfeld & Aragon". */
export function shortAuthors(authors: string) {
  const surname = (a: string) => a.trim().replace(/\s+[A-Z]{1,3}$/, '');
  const parts = authors.split(',').map((a) => a.trim()).filter((a) => a && a !== 'et al.');
  if (parts.length === 1) return parts[0];
  if (parts.length === 2 && !authors.includes('et al.')) return `${surname(parts[0])} & ${surname(parts[1])}`;
  return `${surname(parts[0])} et al.`;
}

/** A source shown in the margin next to the paragraph that cites it. */
export function SideNote({ source, onOpen }: { source: Source; onOpen: (n: number) => void }) {
  return (
    <button type="button" className={styles.note} onClick={() => onOpen(source.number)}>
      <span className={styles.noteTop}>
        <span>
          <span className={styles.noteNum}>{source.number}</span> · {source.type}
        </span>
        {source.year && <span>{source.year}</span>}
      </span>
      <span className={styles.noteTitle}>{source.title}</span>
      <span className={styles.noteSub}>
        {[shortAuthors(source.authors), source.publication].filter(Boolean).join(' · ')}
      </span>
    </button>
  );
}
