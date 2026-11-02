import { ValidationError } from '../lib/errors.js';

/**
 * Express middleware to validate request payload against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const dataToValidate = req[source];
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const formattedErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || 'general';
        formattedErrors[key] = issue.message;
      }
      return next(new ValidationError('Request validation failed', formattedErrors));
    }

    req[source] = result.data;
    next();
  };
}

