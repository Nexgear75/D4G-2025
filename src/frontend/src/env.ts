import { loadEnvConfig } from '@next/env';

import { z } from 'zod';

const pwd = process.cwd();
loadEnvConfig(pwd);

const EnvSchema = z.object({
  API_URL: z.url(),
});

const ENV = EnvSchema.parse({
  API_URL: process.env.API_URL,
});

export default ENV;
