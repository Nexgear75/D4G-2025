import { PropsWithChildren } from 'react';

import type { Metadata } from 'next';

import styles from './layout.module.css';

import '@/style/globals.css';

export const metadata: Metadata = {
  title: 'Lumax',
  description: 'Résumez un texte de moins de 4000 caractères en une phrase concise et claire de 10 à 15 mots.',
};

const RootLayout = ({ children }: Readonly<PropsWithChildren>) => (
  <html lang="fr">
    <body>
      {/* No need to use `aria-hidden` or `role="presentation"` because the screen readers won't take it into account */}
      <div className={styles.decoration} />

      {children}
    </body>
  </html>
);

export default RootLayout;
