import styles from './answer.module.css';

/** Loading / AI-response state shown while an answer is being prepared. */
export function AnswerSkeleton() {
  return (
    <div className={styles.skeleton} role="status" aria-live="polite">
      <div className={styles.thinking}>
        <span className={styles.thinkingDots} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        Checking the evidence…
      </div>
      <div className={styles.skeletonCard}>
        <span className={styles.line} style={{ width: '28%', height: 10 }} />
        <span className={styles.line} style={{ width: '96%' }} />
        <span className={styles.line} style={{ width: '88%' }} />
        <span className={styles.line} style={{ width: '54%' }} />
      </div>
      <div className={styles.skeletonBody}>
        <span className={styles.line} style={{ width: '100%' }} />
        <span className={styles.line} style={{ width: '93%' }} />
        <span className={styles.line} style={{ width: '71%' }} />
      </div>
    </div>
  );
}
