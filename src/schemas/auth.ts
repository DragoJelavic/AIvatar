import z from 'zod';

export const baseAuthSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
