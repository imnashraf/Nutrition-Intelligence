'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { routes } from '../../../lib/nutrition-intelligence/routes';
import type { StarterPrompt, Topic, TryPrompt } from '../../../lib/nutrition-intelligence/types';
import { AppHeader } from '../AppHeader';
import { Composer } from '../Composer';
import { IconAlert, IconArrowUpRight } from '../icons';
import styles from './HomeScreen.module.css';

interface HomeScreenProps {
  /** "Start anywhere" index rows. */
  prompts: StarterPrompt[];
  /** Chips under the composer. */
  tryPrompts: TryPrompt[];
  footerLinks?: { label: string; href: string }[];
}

const PRINCIPLES = [
  { title: 'The answer comes first', body: 'One clear sentence before any detail, so you get what you came for.' },
  {
    title: 'Every claim is sourced',
    body: 'Public health guidance and peer-reviewed research, numbered and one tap away.',
  },
  { title: 'Certainty is stated', body: 'You’ll always know whether the science is settled or still debated.' },
];

const EVIDENCE_SCALE = [
  {
    label: 'Strong',
    bars: 3,
    body: 'Consistent findings across large trials or official guidance. Unlikely to change.',
  },
  { label: 'Moderate', bars: 2, body: 'Good studies point the same way, with some gaps or mixed results.' },
  { label: 'Emerging', bars: 1, body: 'Early or small studies. Interesting, but treat it as provisional.' },
];

const DEFAULT_FOOTER_LINKS = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Methodology', href: '#' },
];

/** 01 · Home */
export function HomeScreen({
  prompts,
  tryPrompts,
  footerLinks = DEFAULT_FOOTER_LINKS,
}: HomeScreenProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const ask = (question: string, topic?: Topic | 'any') => {
    if (busy) return;
    setBusy(true);
    router.push(routes.newConversation(question, topic));
  };

  return (
    <div className={styles.page}>
      {/* ---------- HERO ---------- */}
      <section className={styles.heroWrap}>
        <div className={styles.hero}>
          <AppHeader variant="hero" />

          <div className={styles.heroIntro}>
            <p className={styles.eyebrow}>
              <span className={styles.dot} aria-hidden="true" />
              Evidence-based food intelligence
            </p>
            <h1 className={styles.headline}>
              Know what’s <em>really</em>
              <br />
              on your plate.
            </h1>
            <p className={styles.lede}>
              Ask anything about food, diets or food safety. Get a clear answer, how certain the science is, and the
              sources behind it.
            </p>
          </div>

          <Composer variant="hero" onSubmit={ask} busy={busy} autoFocus />

          <div className={styles.tryRow}>
            <span>Try</span>
            {tryPrompts.map((p, i) => (
              <button
                key={p.label}
                type="button"
                className={`${styles.tryChip} ${i > 1 ? styles.hideSm : ''}`}
                onClick={() => ask(p.question)}
                disabled={busy}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HOW ANSWERS READ ---------- */}
      <section id="how" className={styles.section}>
        <div className={`${styles.container} ${styles.split}`}>
          <div className={styles.howText}>
            <p className={styles.kicker}>How answers read</p>
            <h2 className={styles.h2}>
              Answers you can <em>check</em>, not just trust.
            </h2>
            <ol className={styles.principles}>
              {PRINCIPLES.map((p, i) => (
                <li key={p.title} className={styles.principle}>
                  <span className={styles.principleNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.principleText}>
                    <span className={styles.principleTitle}>{p.title}</span>
                    <span className={styles.principleBody}>{p.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Specimen: an illustration of a food-safety answer with an open citation */}
          <figure className={styles.specimen} aria-label="Example answer">
            <div className={styles.specimenCard}>
              <div className={styles.specimenMeta}>
                <span className={styles.safetyChip}>
                  <IconAlert size={13} strokeWidth={2} />
                  Food safety
                </span>
                <span className={styles.specimenKicker}>Official guidance</span>
              </div>
              <p className={styles.specimenQ}>Can I eat leftover rice the next day?</p>
              <div className={styles.specimenDo}>
                <span className={styles.specimenDoLabel}>Do this</span>
                <span className={styles.specimenDoText}>
                  Cool it within an hour, keep it in the fridge, and eat it within a day. Reheat once, until steaming
                  hot all the way through
                  <span className={styles.specimenCite} aria-hidden="true">
                    1
                  </span>
                </span>
              </div>
              <p className={styles.specimenBody}>
                Uncooked rice can carry spores that survive cooking. Left warm, they multiply and make toxins that
                reheating won’t remove.
              </p>
            </div>
            <div className={styles.popover} aria-hidden="true">
              <span className={styles.popoverKicker}>
                <span className={styles.popoverNum}>1</span> NHS · Food safety guidance
              </span>
              <span className={styles.popoverTitle}>Can reheating rice cause food poisoning?</span>
              <span className={styles.popoverSub}>Public health guidance · Open source ↗</span>
            </div>
          </figure>
        </div>
      </section>

      {/* ---------- INDEX ---------- */}
      <section className={styles.indexSection} aria-labelledby="ni-start">
        <div className={styles.container}>
          <div className={styles.indexHead}>
            <h2 id="ni-start" className={styles.h2Index}>
              Start anywhere.
            </h2>
            <p className={styles.indexLede}>Four questions to start with. Pick one, or ask your own.</p>
          </div>
          <div className={styles.index}>
            {prompts.map((p, i) => (
              <button
                key={p.question}
                type="button"
                className={styles.row}
                onClick={() => ask(p.question, p.topic)}
                disabled={busy}
              >
                <span className={styles.rowNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.rowCat} data-topic={p.topic}>
                  {p.label}
                </span>
                <span className={styles.rowQ}>{p.question}</span>
                <span className={styles.rowArrow} aria-hidden="true">
                  <IconArrowUpRight />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- EVIDENCE SCALE ---------- */}
      <section id="evidence" className={styles.evidenceWrap}>
        <div className={styles.evidenceBand}>
          <div className={`${styles.container} ${styles.evidenceGrid}`}>
            <div className={styles.evidenceIntro}>
              <p className={styles.kicker}>The evidence scale</p>
              <h2 className={styles.h2Evidence}>How sure is the science?</h2>
              <p className={styles.evidenceLede}>
                Nutrition research varies a lot in quality. Every answer carries one of three marks, so you can weigh
                it accordingly.
              </p>
            </div>
            <div className={styles.scale}>
              {EVIDENCE_SCALE.map((e) => (
                <div key={e.label} className={styles.scaleCard}>
                  <span className={styles.scaleBars} aria-hidden="true">
                    {[1, 2, 3].map((n) => (
                      <span key={n} data-on={n <= e.bars ? '' : undefined} />
                    ))}
                  </span>
                  <h3 className={styles.scaleLabel}>{e.label}</h3>
                  <p className={styles.scaleBody}>{e.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <p className={styles.footerMark}>
            Nutrition <em>Intelligence</em>
          </p>
          <div className={styles.footerBar}>
            <span className={styles.footerNote}>
              General information, not personal medical advice. For allergies, pregnancy or a medical condition, check
              with a qualified professional.
            </span>
            <nav className={styles.footerLinks} aria-label="Footer">
              {footerLinks.map((l) => (
                <a key={l.label} href={l.href}>
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
