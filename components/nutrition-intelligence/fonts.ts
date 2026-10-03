import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';

/**
 * Instrument Serif (display + reading accents), Geist (UI + body) and
 * Geist Mono (small labels, citation numbers).
 * Self-hosted at build time by next/font — no runtime request to Google.
 * Exposed as CSS variables consumed by `styles/tokens.css`.
 */
export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-ni-serif',
  display: 'swap',
});

export const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-ni-sans',
  display: 'swap',
});

export const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-ni-mono',
  display: 'swap',
});

/** All three font variables, for the root wrapper (and portals). */
export const fontVariables = `${instrumentSerif.variable} ${geistSans.variable} ${geistMono.variable}`;
