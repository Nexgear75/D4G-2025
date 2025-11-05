import { z } from 'zod';

const EnvSchema = z.object({
  API_URL: z.url(),
});

const ENV = EnvSchema.parse({
  API_URL: process.env.API_URL,
});

export default ENV;
