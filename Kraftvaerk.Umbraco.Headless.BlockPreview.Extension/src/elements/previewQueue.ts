/**
 * Thrown when a queued preview request was superseded before it got a turn.
 * Callers treat it as "nothing to do", not as a failure.
 */
export class StalePreviewError extends Error {
  constructor() {
    super('Preview request superseded');
    this.name = 'StalePreviewError';
  }
}

/**
 * Limits how many preview requests a backoffice tab has in flight at once.
 *
 * A page with many blocks used to fire one request per block the moment it loaded, which meant the
 * render host got hit by dozens of simultaneous renders and the slowest ones crossed the timeout.
 * Requests now wait here for a free slot instead.
 */
export class PreviewQueue {
  #max: number;
  #active = 0;
  #waiting: Array<() => void> = [];

  constructor(maxConcurrent = 6) {
    this.#max = Math.max(1, maxConcurrent);
  }

  get maxConcurrent(): number {
    return this.#max;
  }

  set maxConcurrent(value: number) {
    this.#max = Math.max(1, Math.floor(value) || 1);
    this.#drain();
  }

  get active(): number {
    return this.#active;
  }

  get pending(): number {
    return this.#waiting.length;
  }

  /**
   * Runs `task` when a slot is free. If `isStale()` reports true by then the task is skipped
   * and the returned promise rejects with StalePreviewError.
   */
  async run<T>(task: () => Promise<T>, isStale?: () => boolean): Promise<T> {
    await this.#acquire();
    try {
      if (isStale?.()) throw new StalePreviewError();
      return await task();
    } finally {
      this.#release();
    }
  }

  #acquire(): Promise<void> {
    if (this.#active < this.#max) {
      this.#active++;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.#waiting.push(() => {
        this.#active++;
        resolve();
      });
    });
  }

  #release() {
    this.#active--;
    this.#drain();
  }

  #drain() {
    while (this.#active < this.#max && this.#waiting.length > 0) {
      const next = this.#waiting.shift();
      next?.();
    }
  }
}
