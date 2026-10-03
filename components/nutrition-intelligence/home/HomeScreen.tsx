'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { routes } from '../../../lib/nutrition-intelligence/routes';
import type { StarterPrompt, Topic } from '../../../lib/nutrition-intelligence/types';
import { AppHeader } from '../AppHeader';
import { Composer } from '../Composer';
import styles from './HomeScreen.module.css';

interface HomeScreenProps {
  prompts: StarterPrompt[];
  accountInitials?: string;
}

const PRINCIPLES = [
  {
    title: 'Cited, every time',
    body: 'Answers draw on public health guidelines and peer-reviewed research, with sources you can open.',
  },
  {
    title: 'Honest about certainty',
    body: 'Each answer says how strong the evidence is, so you can tell settled science from open debate.',
  },
  {
    title: 'Safety comes first',
    body: 'Food safety answers lead with what to do, then explain why.',
  },
];

/** 01 · Home */
export function HomeScreen({ prompts, accountInitials }: HomeScreenProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const ask = (question: string, topic?: Topic | 'any') => {
    setBusy(true);
    router.push(routes.newConversation(question, topic));
  };

  return (
    <>
      <AppHeader variant="home" accountInitials={accountInitials} />

      <main className={styles.main}>
        <div className={styles.column}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Evidence-based food &amp; nutrition answers</p>
            <h1 className={styles.headline}>What would you like to understand about food?</h1>
          </div>

          <Composer variant="hero" onSubmit={ask} busy={busy} autoFocus />

          <section className={styles.prompts} aria-labelledby="ni-starters">
            <h2 id="ni-starters" className={styles.promptsLabel}>
              Or start with one of these
            </h2>
            <div className={styles.promptGrid}>
              {prompts.map((p) => (
                <button
                  key={p.question}
                  type="button"
                  className={styles.prompt}
                  onClick={() => ask(p.question, p.topic)}
                  disabled={busy}
                >
                  <span className={styles.promptTopic} data-topic={p.topic}>
                    {p.label}
                  </span>
                  <span className={styles.promptText}>{p.question}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.principles} aria-label="How answers work">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className={styles.principle}>
                <h3 className={styles.principleTitle}>{p.title}</h3>
                <p className={styles.principleBody}>{p.body}</p>
              </div>
            ))}
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        General information, not personal medical advice. For allergies, pregnancy or a medical condition, check with a
        qualified professional.
      </footer>
    </>
  );
}
