export class ScanLyserError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ScanLyserError';
  }
}

export class AuthenticationError extends ScanLyserError {
  constructor(message = 'Authentication failed.') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class ForbiddenError extends ScanLyserError {
  constructor(message = 'Access denied.') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ScanLyserError {
  constructor(message = 'Resource not found.') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ScanLyserError {
  constructor(
    message = 'Validation failed.',
    public readonly errors: Record<string, string[]> = {},
  ) {
    super(message, 422);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends ScanLyserError {
  constructor(message = 'Rate limit exceeded.') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export function mapError(status: number, body: Record<string, unknown>): ScanLyserError {
  const error = (body.error ?? {}) as Record<string, unknown>;
  const message = (error.message as string) ?? `API request failed with status ${status}`;
  const errors = (error.errors ?? {}) as Record<string, string[]>;

  switch (status) {
    case 401: return new AuthenticationError(message);
    case 403: return new ForbiddenError(message);
    case 404: return new NotFoundError(message);
    case 422: return new ValidationError(message, errors);
    case 429: return new RateLimitError(message);
    default: return new ScanLyserError(message, status);
  }
}
