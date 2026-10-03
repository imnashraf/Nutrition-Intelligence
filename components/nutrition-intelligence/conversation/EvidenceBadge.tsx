import { EVIDENCE } from '../../../lib/nutrition-intelligence/topics';
import type { EvidenceLevel } from '../../../lib/nutrition-intelligence/types';
import styles from './answer.module.css';

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const { label, bars } = EVIDENCE[level];
  return (
    <span className={styles.evidence}>
      <span className={styles.bars} aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={styles.bar} data-on={n <= bars ? '' : undefined} />
        ))}
      </span>
      {label}
    </span>
  );
}
