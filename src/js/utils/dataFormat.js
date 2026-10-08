/**
 * Shared helpers for task data tables and charts
 */

// Column/series names that hold money. "sales" and "($)" were missing, so
// Product Comparison's "Sales ($)" column was never formatted (#2429)
const CURRENCY_KEYWORDS = ['revenue', 'expense', 'profit', 'money', 'cost', 'price', 'salary', 'budget', 'sales', '($)'];

export function isCurrencyColumn(name) {
    const n = String(name || '').toLowerCase();
    return CURRENCY_KEYWORDS.some(k => n.includes(k));
}

/**
 * Split `total` into integers proportional to `weights` that add up to
 * exactly `total` (largest remainder method) (#2427)
 */
export function proportionalSplit(weights, total = 100) {
    const w = weights.map(x => Math.max(0, Number(x) || 0));
    const sum = w.reduce((a, b) => a + b, 0);
    if (w.length === 0) return [];
    if (sum === 0) return proportionalSplit(w.map(() => 1), total);
    const raw = w.map(x => (x / sum) * total);
    const out = raw.map(Math.floor);
    let left = total - out.reduce((a, b) => a + b, 0);
    const order = raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]);
    for (let k = 0; left > 0; k = (k + 1) % order.length, left--) out[order[k][1]]++;
    return out;
}

/**
 * Random integers in [min, max] that add up to `total`, e.g. five category
 * shares of 10-40% summing to 100 (#1855, #960). Falls back to an even
 * split when the bounds can't be met.
 */
export function boundedPartition(n, total, min, max, rand = Math.random) {
    if (n <= 0) return [];
    if (n * min > total || n * max < total) {
        return proportionalSplit(Array(n).fill(1), total);
    }
    const out = Array(n).fill(min);
    let left = total - n * min;
    while (left > 0) {
        const open = out.map((v, i) => (v < max ? i : -1)).filter(i => i >= 0);
        const i = open[Math.floor(rand() * open.length)];
        out[i]++;
        left--;
    }
    return out;
}
