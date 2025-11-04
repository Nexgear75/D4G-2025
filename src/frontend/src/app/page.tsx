import styles from './page.module.css';

import PromptForm from '@/components/prompt-form';

export interface HomePageParams {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const HomePage = async ({ searchParams }: HomePageParams) => {
  const rawSearchParams = await searchParams;

  const rawDefaultPrompt = rawSearchParams['prompt'];
  const rawDefaultOptimized = rawSearchParams['optimized'];

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Design4Green - Lumax</h1>
        <h2 className={styles.subtitle}>
          An eco-designed text summarizer that combines efficiency and sustainability.
        </h2>
      </header>

      <main className={styles.main}>
        <PromptForm
          defaultPrompt={typeof rawDefaultPrompt === 'string' ? rawDefaultPrompt : ''}
          defaultOptimized={typeof rawDefaultOptimized === 'string' ? rawDefaultOptimized === 'true' : false}
        />
      </main>

      <footer></footer>
    </>
  );
};

export default HomePage;
