'use client';

import type { RichText as RichTextType, Source } from '../../../lib/nutrition-intelligence/types';
import styles from './answer.module.css';

interface RichTextProps {
  nodes: RichTextType;
  sources?: Source[];
  onCite?: (n: number) => void;
}

/** Renders structured answer text with inline citation chips. */
export function RichText({ nodes, sources, onCite }: RichTextProps) {
  return (
    <>
      {nodes.map((node, i) => {
        if (typeof node === 'string') return <span key={i}>{node}</span>;
        if ('strong' in node) return <strong key={i}>{node.strong}</strong>;
        const source = sources?.find((s) => s.number === node.cite);
        return (
          <button
            key={i}
            type="button"
            className={styles.cite}
            onClick={() => onCite?.(node.cite)}
            aria-label={`Source ${node.cite}${source ? `: ${source.title}` : ''}`}
            title={source ? `${source.authors.split(',')[0]} · ${source.publication}` : undefined}
          >
            {node.cite}
          </button>
        );
      })}
    </>
  );
}
