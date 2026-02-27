/**
 * Computes the Levenshtein (edit) distance between two strings.
 * Returns the minimum number of single-character edits (insertions,
 * deletions, or substitutions) required to change `a` into `b`.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  // Create a 2D DP table
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Given a query and a list of candidate strings, returns the candidate
 * with the smallest Levenshtein distance to the query (case-insensitive).
 * Returns null if the candidates list is empty.
 */
export function closestMatch(query: string, candidates: string[]): string | null {
  if (candidates.length === 0) return null;

  const q = query.toLowerCase();
  let best = candidates[0];
  let bestDist = levenshtein(q, candidates[0].toLowerCase());

  for (let i = 1; i < candidates.length; i++) {
    const dist = levenshtein(q, candidates[i].toLowerCase());
    if (dist < bestDist) {
      bestDist = dist;
      best = candidates[i];
    }
  }

  return best;
}
