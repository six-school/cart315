export function assertNever(value: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}

/** Returns a random number between min and max (inclusive). */
export function randomInt(min: number, max?: number): number {
  /* eslint-disable no-param-reassign */
  if (max == null) {
    max = min;
    min = 0;
  }
  if (max < min) [min, max] = [max, min];
  return Math.floor(Math.random() * (max + 1 - min)) + min;
  /* eslint-enable no-param-reassign */
}

export function randomInArray<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error("Empty array!");
  return arr[Math.floor(Math.random() * arr.length)];
}

// TODO: handle empty objects, zero weights
export function randomByWeight(weights: { [value: string]: number }): string {
  const keys = Object.keys(weights);
  const sum = Object.values(weights).reduce((p, c) => {
    if (c < 0) throw new Error("Negative weight!");
    return p + c;
  }, 0);
  if (sum === 0) throw new Error("Weights add up to zero!");
  const choose = Math.floor(Math.random() * sum);
  for (let i = 0, count = 0; i < keys.length; i++) {
    count += weights[keys[i]];
    if (count > choose) {
      return keys[i];
    }
  }
  throw new Error("We goofed!");
}
