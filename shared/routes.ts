import { z } from 'zod';
import { insertCaseSchema, cases } from './schema';

export const api = {
  cases: {
    create: {
      method: 'POST' as const,
      path: '/api/cases',
      // Input is validated manually for multipart/form-data, but here is the metadata schema
      input: insertCaseSchema.extend({
        // file is handled by multer
      }),
      responses: {
        201: z.custom<typeof cases.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/cases',
      responses: {
        200: z.array(z.custom<typeof cases.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/cases/:id',
      responses: {
        200: z.custom<typeof cases.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    // Optional: Separate endpoint to start processing if not auto-started
    process: {
      method: 'POST' as const,
      path: '/api/cases/:id/process',
      responses: {
        200: z.object({ message: z.string() }),
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
