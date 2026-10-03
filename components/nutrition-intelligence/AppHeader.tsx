import Link from 'next/link';
import { routes } from '../../lib/nutrition-intelligence/routes';
import { IconPlus, LogoMark } from './icons';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  /**
   * `hero`: light-on-forest header that sits inside the home hero.
   * `app`: sticky light header for conversation screens.
   */
  variant: 'hero' | 'app';
}

export function AppHeader({ variant }: AppHeaderProps) {
  if (variant === 'hero') {
    return (
      <header className={styles.hero}>
        <Link href={routes.home} className={styles.heroBrand}>
          <LogoMark className={styles.heroMark} />
          <span className={styles.wordmark}>Nutrition Intelligence</span>
        </Link>
        <nav className={styles.heroNav} aria-label="Main">
          <a href="#how" className={styles.heroLink}>
            How it works
          </a>
          <a href="#evidence" className={styles.heroLink}>
            Evidence
          </a>
        </nav>
      </header>
    );
  }

  return (
    <header className={styles.app}>
      <Link href={routes.home} className={styles.appBrand} aria-label="Nutrition Intelligence home">
        <LogoMark className={styles.appMark} />
        <span className={`${styles.wordmark} ${styles.hideSm}`}>Nutrition Intelligence</span>
      </Link>
      <nav className={styles.appNav} aria-label="Main">
        <Link href={routes.home} className={styles.primary}>
          <IconPlus strokeWidth={1.7} />
          <span>New question</span>
        </Link>
      </nav>
    </header>
  );
}
