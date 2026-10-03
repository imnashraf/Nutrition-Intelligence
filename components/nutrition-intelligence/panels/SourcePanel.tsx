'use client';

import type { Source } from '../../../lib/nutrition-intelligence/types';
import { shortAuthors } from '../conversation/SideNote';
import { IconClose, IconExternal } from '../icons';
import { Drawer } from './Drawer';
import panel from './panel.module.css';
import styles from './SourcePanel.module.css';

interface SourcePanelProps {
  open: boolean;
  onClose: () => void;
  sources: Source[];
  activeNumber: number;
  onSelect: (number: number) => void;
}

/** 04 · Source panel — details for each citation in an answer. */
export function SourcePanel({ open, onClose, sources, activeNumber, onSelect }: SourcePanelProps) {
  const active = sources.find((s) => s.number === activeNumber) ?? sources[0];
  if (!active) return null;

  return (
    <Drawer open={open} onClose={onClose} side="right" labelledBy="ni-source-title">
      <div className={panel.header}>
        <div className={panel.titleGroup}>
          <span className={panel.eyebrow}>
            Source {active.number} of {sources.length}
          </span>
          <h2 id="ni-source-title" className={panel.title}>
            Sources
          </h2>
        </div>
        <button type="button" className={panel.close} onClick={onClose} aria-label="Close sources" data-autofocus="">
          <IconClose />
        </button>
      </div>

      <div className={panel.body}>
        <div className={styles.stack}>
          {sources.length > 1 && (
            <div className={styles.picker} role="group" aria-label="Choose a source">
              {sources.map((s) => (
                <button
                  key={s.number}
                  type="button"
                  className={styles.pick}
                  aria-pressed={s.number === active.number}
                  aria-label={`Source ${s.number}`}
                  onClick={() => onSelect(s.number)}
                >
                  {s.number}
                </button>
              ))}
            </div>
          )}

          <article className={styles.detail} aria-live="polite">
            <div className={styles.meta}>
              <span className={styles.type}>{active.type}</span>
              {active.year && <span className={styles.year}>{active.year}</span>}
            </div>
            <h3 className={styles.title}>{active.title}</h3>
            <dl className={styles.facts}>
              <div>
                <dt>Authors</dt>
                <dd>{active.authors}</dd>
              </div>
              <div>
                <dt>Published in</dt>
                <dd>{active.publication}</dd>
              </div>
            </dl>

            <div className={styles.supports}>
              <span className={styles.supportsLabel}>Used in this answer for</span>
              <p className={styles.supportsText}>{active.supports}</p>
            </div>

            {active.url ? (
              <a className={styles.open} href={active.url} target="_blank" rel="noopener noreferrer">
                Open original
                <IconExternal />
                <span className="ni-sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <p className={styles.noLink}>The original isn’t linked for this source.</p>
            )}
          </article>

          {sources.length > 1 && (
            <section className={styles.all} aria-labelledby="ni-all-sources">
              <h3 id="ni-all-sources" className={styles.allLabel}>
                All sources in this answer
              </h3>
              <ul className={styles.allList}>
                {sources.map((s) => (
                  <li key={s.number}>
                    <button
                      type="button"
                      className={styles.allItem}
                      aria-current={s.number === active.number ? 'true' : undefined}
                      onClick={() => onSelect(s.number)}
                    >
                      <span className={styles.allNum}>{s.number}</span>
                      <span className={styles.allText}>
                        <span className={styles.allTitle}>{s.title}</span>
                        <span className={styles.allSub}>
                          {[shortAuthors(s.authors), s.year].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Drawer>
  );
}
