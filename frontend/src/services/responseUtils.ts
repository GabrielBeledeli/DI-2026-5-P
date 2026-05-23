export function extractArray<T>(payload: unknown, keys: string[] = []): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const candidateKeys = [...keys, 'data', 'items', 'results'];

  for (const key of candidateKeys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
}
