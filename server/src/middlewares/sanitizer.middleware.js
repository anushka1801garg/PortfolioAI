import mongoSanitize from "express-mongo-sanitize";

/**
 * Express 5 compatible query parser configurator.
 * Express 5 evaluates req.query dynamically on every access using app.get('query parser fn').
 * Sanitizing during parse ensures any access to req.query returns NoSQL-safe objects.
 *
 * @param {import("express").Express} app
 */
export const configureQueryParser = (app) => {
  const defaultQueryParser = app.get("query parser fn");
  app.set("query parser", (str) => {
    const parsed = defaultQueryParser ? defaultQueryParser(str) : {};
    if (parsed && typeof parsed === "object") {
      mongoSanitize.sanitize(parsed);
    }
    return parsed;
  });
};

/**
 * Express 5 compatible input sanitization middleware.
 * Neutralizes NoSQL operator injection ($gt, $ne, $where, etc.) across body, params, and query.
 *
 * 1. req.body: Sanitizes in-place (nested objects, arrays, and URL-encoded bodies).
 * 2. req.params: Configures an interceptor with getter/setter so parameters populated
 *    during route matching are sanitized immediately before controllers execute.
 * 3. req.query: Overrides the Express 5 getter with a sanitized own property via Object.defineProperty,
 *    preventing repeated re-parsing overhead while avoiding direct assignment.
 */
export const sanitizeInput = (req, res, next) => {
  // 1. Sanitize request body
  if (req.body && typeof req.body === "object") {
    mongoSanitize.sanitize(req.body);
  }

  // 2. Intercept route parameters when matched
  let _params = req.params || {};
  Object.defineProperty(req, "params", {
    get() {
      return _params;
    },
    set(newParams) {
      if (newParams && typeof newParams === "object") {
        mongoSanitize.sanitize(newParams);
      }
      _params = newParams;
    },
    configurable: true,
    enumerable: true,
  });

  // If params already exist (e.g. from parent router)
  if (req.params && typeof req.params === "object") {
    mongoSanitize.sanitize(req.params);
  }

  // 3. Sanitize and pin query parameters
  if (req.query) {
    const sanitized = mongoSanitize.sanitize(req.query);
    Object.defineProperty(req, "query", {
      value: sanitized,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  next();
};

/**
 * Route-level middleware to explicitly sanitize route parameters after route matching.
 * Can be used as defense-in-depth on parameterized routes.
 */
export const sanitizeParams = (req, res, next) => {
  if (req.params && typeof req.params === "object") {
    mongoSanitize.sanitize(req.params);
  }
  next();
};

export default {
  configureQueryParser,
  sanitizeInput,
  sanitizeParams,
};
