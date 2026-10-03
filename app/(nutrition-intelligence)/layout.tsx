import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { geistMono, geistSans } from '../../components/nutrition-intelligence/fonts';
import '../../components/nutrition-intelligence/styles/tokens.css';

export const metadata: Metadata = {
  title: {
    default: 'Nutrition Intelligence',
    template: '%s · Nutrition Intelligence',
  },
  description: 'Clear, evidence-based answers about food, nutrition and food safety.',
};

/**
 * Nested layout for every Nutrition Intelligence screen.
 * It sits inside your existing root layout (app/layout.tsx), which keeps
 * its own <html> and <body>.
 */
export default function NutritionIntelligenceLayout({ children }: { children: ReactNode }) {
  return <div className={`ni-root ${geistSans.variable} ${geistMono.variable}`}>{children}</div>;
}
