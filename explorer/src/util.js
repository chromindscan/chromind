/**
 * Catches errors from a promise and returns a tuple with either an error or the resolved data.
 *
 * @template T
 * @param {Promise<T>} promise - The promise to handle.
 * @returns {Promise<[undefined, T] | [Error]>} A promise that resolves to either:
 *   - A tuple containing `undefined` and the resolved data.
 *   - A tuple containing an `Error` object.
 */
export function catchError(promise) {
  return promise
    .then((data) => [undefined, data])
    .catch((err) => [err instanceof Error ? err : new Error(String(err))]);
}

export function uint8ArrayToHex(uint8Array) {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
