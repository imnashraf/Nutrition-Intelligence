import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Nutrition Intelligence',
  description: 'Evidence-backed nutrition answers grounded in official dietary guidance.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
