import type { LifecycleFailure, Scan } from '../types/index.js';

export function hydrateLifecycleFailure(
  failure: LifecycleFailure | null | undefined,
): LifecycleFailure | null {
  if (failure === null || failure === undefined) {
    return null;
  }

  return {
    code: failure.code,
    message: failure.message,
    correlation_id: failure.correlation_id,
  };
}

export function hydrateScan(scan: Scan): Scan {
  return {
    ...scan,
    failure: hydrateLifecycleFailure(scan.failure),
  };
}
