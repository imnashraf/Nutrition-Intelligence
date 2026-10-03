'use client';

import type { RichText as RichTextType, Source } from '../../../lib/nutrition-intelligence/types';
import styles from './answer.module.css';

interface RichTextProps {
  nodes: RichTextType;
  sources?: Source[];
  onCite?: (n: number) => void;
  /** `dark` renders on the forest short-answer card. */
  tone?: 'light' | 'dark';
  /** `highlight` renders `{ strong }` as the italic accent phrase (short answer). */
  emphasis?: 'strong' | 'highlight';
}

/** Renders structured answer text with superscript citation buttons. */
export function RichText({ nodes, sources, onCite, tone = 'light', emphasis = 'strong' }: RichTextProps) {
  return (
    <>
      {nodes.map((node, i) => {
        if (typeof node === 'string') return <span key={i}>{node}</span>;
        if ('strong' in node) {
          return emphasis === 'highlight' ? (
            <em key={i} className={styles.highlight} data-tone={tone}>
              {node.strong}
            </em>
          ) : (
            <strong key={i} className={styles.strong}>
              {node.strong}
            </strong>
          );
        }
        const source = sources?.find((s) => s.number === node.cite);
        return (
          <sup key={i} className={styles.citeWrap}>
            <button
              type="button"
              className={styles.cite}
              data-tone={tone}
              onClick={() => onCite?.(node.cite)}
              aria-label={`Source ${node.cite}${source ? `: ${source.title}` : ''}`}
            >
              {node.cite}
            </button>
          </sup>
        );
      })}
    </>
  );
}

/** Citation numbers used in a piece of rich text, in order of appearance. */
export function citesIn(nodes: RichTextType | undefined): number[] {
  if (!nodes) return [];
  const out: number[] = [];
  for (const n of nodes) {
    if (typeof n !== 'string' && 'cite' in n && !out.includes(n.cite)) out.push(n.cite);
  }
  return out;
}
