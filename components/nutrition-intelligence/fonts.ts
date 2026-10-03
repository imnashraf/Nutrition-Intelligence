import { Geist, Geist_Mono } from 'next/font/google';

/**
 * Geist (UI + body) and Geist Mono (small labels, citation numbers).
 * Self-hosted at build time by next/font — no runtime request to Google.
 * Exposed as CSS variables consumed by `styles/tokens.css`.
 */
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
