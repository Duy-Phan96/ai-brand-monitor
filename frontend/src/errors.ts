/** Stable message categories preserve localization across language switches. */
export class UIError extends Error {
  constructor(
    public readonly key: string,
    public readonly status?: number,
  ) {
    super(key);
  }
}
