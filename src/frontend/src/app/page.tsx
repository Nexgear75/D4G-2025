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
        <p className={styles.subtitle}>An eco-designed text summarizer that combines efficiency and sustainability.</p>
      </header>

      <main className={styles.main}>
        <PromptForm defaultPrompt={rawDefaultPrompt ?? ''} defaultOptimized={rawDefaultOptimized === 'true'} />

        {typeof summary === 'string' && (
          <section
            className={styles.resultContainer}
            aria-label="Summary Results"
            aria-live="polite"
            aria-atomic="true"
          >
            <h2 className="sr-only">Generated Summary</h2>
            <p className={styles.summaryText}>{summary}</p>

            <div className={styles.statsContainer} role="region" aria-label="Performance Metrics">
              <h3 className="sr-only">Performance Statistics</h3>

              {energy !== undefined && (
                <div className={styles.statsItem}>
                  <h4 className={styles.statsLabel} id="energy-label">
                    Energie
                  </h4>
                  <p className={styles.statsValue} aria-labelledby="energy-label">
                    {energy} <abbr title="Watt-hours">Wh</abbr>
                  </p>
                </div>
              )}

              {latency !== undefined && (
                <div className={styles.statsItem}>
                  <h4 className={styles.statsLabel} id="latency-label">
                    Latence
                  </h4>
                  <p className={styles.statsValue} aria-labelledby="latency-label">
                    {latency} <abbr title="milliseconds">ms</abbr>
                  </p>
                </div>
              )}

              {memory !== undefined && (
                <div className={styles.statsItem}>
                  <h4 className={styles.statsLabel} id="memory-label">
                    Mémoire
                  </h4>
                  <p className={styles.statsValue} aria-labelledby="memory-label">
                    {memory} <abbr title="Megabytes">Mb</abbr>
                  </p>
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
