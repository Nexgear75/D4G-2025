import styles from './page.module.css';

import PromptForm from '@/components/prompt-form';
import { getSingleNumberValueFromSearchParam, getSingleValueFromSearchParam } from '@/utils/string';

export interface HomePageParams {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const HomePage = async ({ searchParams }: HomePageParams) => {
  const rawSearchParams = await searchParams;

  const rawDefaultPrompt = getSingleValueFromSearchParam(rawSearchParams['prompt']);
  const rawDefaultOptimized = getSingleValueFromSearchParam(rawSearchParams['optimized']);

  const summary = getSingleValueFromSearchParam(rawSearchParams['summary']);

  const energy = getSingleNumberValueFromSearchParam(rawSearchParams['energy']);
  const latency = getSingleNumberValueFromSearchParam(rawSearchParams['latency']);
  const memory = getSingleNumberValueFromSearchParam(rawSearchParams['memory']);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Design4Green - Lumax</h1>
        <h2 className={styles.subtitle}>
          An eco-designed text summarizer that combines efficiency and sustainability.
        </h2>
      </header>

      <main className={styles.main}>
        <PromptForm defaultPrompt={rawDefaultPrompt ?? ''} defaultOptimized={rawDefaultOptimized === 'true'} />

        {typeof summary === 'string' && (
          <section className={styles.resultContainer}>
            <p className={styles.summaryText}>{summary}</p>

            <div className={styles.statsContainer}>
              {energy !== undefined && (
                <div className={styles.statsItem}>
                  <h3 className={styles.statsLabel}>Energie</h3>
                  <p className={styles.statsValue}>{energy} Wh</p>
                </div>
              )}

              {latency !== undefined && (
                <div className={styles.statsItem}>
                  <h3 className={styles.statsLabel}>Latence</h3>
                  <p className={styles.statsValue}>{latency} ms</p>
                </div>
              )}

              {memory !== undefined && (
                <div className={styles.statsItem}>
                  <h3 className={styles.statsLabel}>Mémoire</h3>
                  <p className={styles.statsValue}>{memory} Mb</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Design4Green Projet 2025 - Lukas Laudrain, Thomas Béchu, Alex Fougeroux</p>
      </footer>
    </>
  );
};

export default HomePage;
