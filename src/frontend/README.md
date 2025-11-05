## Design4Green Front-end

### Testing

This project uses Vitest and Testing Library.

- Run tests: `pnpm test` (or `npm run test`)
- Watch mode: `pnpm test:watch`
- Coverage: `pnpm test:coverage`

Test files are located under `src/test/**`.

Included coverage:
- Utils: `src/utils/string.ts`, `src/utils/schemas.ts`
- Components: `src/components/prompt-form.tsx`, `src/components/visually-hidden.tsx`
- App page: `src/app/page.tsx` (server component rendered as a function)

