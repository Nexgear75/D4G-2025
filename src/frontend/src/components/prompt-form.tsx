'use client';
import { useActionState } from 'react';

import styles from './prompt-form.module.css';
import { Field, Label, Switch, Textarea } from '@headlessui/react';

import { getSummary, State } from '@/app/actions';
import VisuallyHidden from '@/components/visually-hidden';

export interface PromptFormProps {
  defaultPrompt: string;
  defaultOptimized: boolean;
}

const PromptForm = ({ defaultPrompt, defaultOptimized }: PromptFormProps) => {
  const initialState: State = {
    errors: {},
    message: null,
    data: { prompt: defaultPrompt, optimized: defaultOptimized },
  };

  const [state, formAction, isPending] = useActionState(getSummary, initialState);

  return (
    <form className={styles.form} action={formAction}>
      <Field>
        <VisuallyHidden>
          <Label htmlFor="prompt">Texte à résumer</Label>
        </VisuallyHidden>

        <Textarea
          className={styles.textarea}
          name="prompt"
          placeholder="Entrez un texte de moins de 4000 caractères pour le résumer en une phrase de 10 à 15 mots."
          id="prompt"
          maxLength={4000}
          rows={10}
          aria-describedby="prompt-error"
          disabled={isPending}
          defaultValue={state.data.prompt}
          required
        />
      </Field>

      <div id="prompt-error" aria-live="polite" aria-atomic="true">
        {'errors' in state &&
          state.errors?.prompt &&
          state.errors.prompt?.errors.map((error) => (
            <p className={styles.error} key={error}>
              {error}
            </p>
          ))}
      </div>

      <div className={styles.formFooter}>
        <Field className={styles.switchField}>
          <Switch
            className={styles.switch}
            id="optimized"
            name="optimized"
            defaultChecked={state.data.optimized}
            disabled={isPending}
          >
            <span className={styles.switchIndicator} />
          </Switch>

          <Label htmlFor="optimized">Non optimisé</Label>
        </Field>

        <button type="submit" disabled={isPending} className={styles.submitButton}>
          Générer le résumé
        </button>
      </div>
    </form>
  );
};

export default PromptForm;
