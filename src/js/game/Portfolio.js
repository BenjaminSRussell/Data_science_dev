/**
 * Career portfolio: a durable record of every scored chart submission
 * (#2715), versioned so later formats can migrate old saves (#2717).
 * Saved with the game (GameState.toJSON), so it survives reloads and travels
 * with exported saves. IndexedDB storage is tracked separately in #2714.
 */

export const PORTFOLIO_SCHEMA_VERSION = 1;
export const PORTFOLIO_MAX = 100;

const CHART_FIELDS = ['type', 'palette', 'showLegend', 'showGrid', 'showDataLabels', 'title'];

function pickChartConfig(cfg) {
    const out = {};
    for (const key of CHART_FIELDS) {
        if (cfg && cfg[key] !== undefined) out[key] = cfg[key];
    }
    return out;
}

function clampStars(n) {
    const v = Math.round(Number(n));
    return Number.isFinite(v) ? Math.max(1, Math.min(5, v)) : 1;
}

/** Build a portfolio entry from a scored submission. */
export function makePortfolioEntry(task, chartConfig, score, { day = 0, now = Date.now() } = {}) {
    const round = (n) => (Number.isFinite(Number(n)) ? Math.round(Number(n)) : 0);
    return {
        schemaVersion: PORTFOLIO_SCHEMA_VERSION,
        taskId: String(task?.id ?? ''),
        taskName: String(task?.name || task?.title || 'Untitled task'),
        domain: String(task?.domain || 'general'),
        difficulty: Number(task?.difficulty) || 0,
        chartConfig: pickChartConfig(chartConfig),
        stars: clampStars(score?.stars),
        scores: {
            chartAppropriateness: round(score?.chartAppropriateness),
            visualClarity: round(score?.visualClarity),
            dataAccuracy: round(score?.dataAccuracy),
            rawScore: round(score?.rawScore)
        },
        moneyEarned: round(score?.moneyEarned),
        day: Number(day) || 0,
        submittedAt: Number(now) || 0
    };
}

/**
 * Bring a saved entry up to the current schema. Entries written before
 * versioning (no schemaVersion) are treated as version 0. Anything that
 * isn't an object with a task id or name is dropped (returns null).
 * Entries from a newer build are kept untouched so a downgrade doesn't
 * destroy them.
 */
export function migratePortfolioEntry(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const version = Number.isInteger(raw.schemaVersion) ? raw.schemaVersion : 0;
    if (version > PORTFOLIO_SCHEMA_VERSION) return { ...raw };
    if (!raw.taskId && !raw.taskName) return null;
    // v0 -> v1: add the version, normalise scores/config, timestamp field name
    const entry = makePortfolioEntry(
        { id: raw.taskId, name: raw.taskName, domain: raw.domain, difficulty: raw.difficulty },
        raw.chartConfig,
        { ...(raw.scores || {}), stars: raw.stars, moneyEarned: raw.moneyEarned },
        { day: raw.day, now: raw.submittedAt ?? raw.timestamp ?? 0 }
    );
    return entry;
}

/** Migrate and cap a saved list (newest last). */
export function normalizePortfolio(list) {
    if (!Array.isArray(list)) return [];
    return list.map(migratePortfolioEntry).filter(Boolean).slice(-PORTFOLIO_MAX);
}

/** Append an entry, keeping at most PORTFOLIO_MAX (oldest dropped). */
export function addPortfolioEntry(list, entry) {
    const next = Array.isArray(list) ? [...list, entry] : [entry];
    return next.slice(-PORTFOLIO_MAX);
}

/** Filter by domain ('all' or empty = any) and minimum stars. */
export function filterPortfolio(list, { domain = 'all', minStars = 1 } = {}) {
    return (Array.isArray(list) ? list : []).filter(e =>
        (domain === 'all' || !domain || e.domain === domain) && (e.stars || 0) >= minStars);
}

export function portfolioDomains(list) {
    return [...new Set((Array.isArray(list) ? list : []).map(e => e.domain))].sort();
}

export function portfolioStats(list) {
    const items = Array.isArray(list) ? list : [];
    const avg = items.length ? items.reduce((s, e) => s + (e.stars || 0), 0) / items.length : 0;
    return {
        count: items.length,
        averageStars: Math.round(avg * 10) / 10,
        fiveStar: items.filter(e => e.stars === 5).length
    };
}

/** JSON export for backups or a personal website. */
export function exportPortfolioJSON(list, now = Date.now()) {
    return JSON.stringify({
        schemaVersion: PORTFOLIO_SCHEMA_VERSION,
        exportedAt: new Date(now).toISOString(),
        entries: normalizePortfolio(list)
    }, null, 2);
}

const escapeHTML = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Modal markup for the portfolio, newest first. Buttons call game.* handlers. */
export function renderPortfolioHTML(list, { domain = 'all', minStars = 1 } = {}) {
    const all = Array.isArray(list) ? list : [];
    const shown = filterPortfolio(all, { domain, minStars });
    const stats = portfolioStats(all);
    const options = ['all', ...portfolioDomains(all)]
        .map(d => `<option value="${escapeHTML(d)}"${d === domain ? ' selected' : ''}>${d === 'all' ? 'All domains' : escapeHTML(d)}</option>`)
        .join('');
    const rows = shown.map(e => ({ e, index: all.indexOf(e) })).reverse().map(({ e, index }) => `
        <li class="portfolio-entry">
            <strong>${escapeHTML(e.taskName)}</strong>
            <span class="portfolio-meta">${escapeHTML(e.domain)} · difficulty ${e.difficulty} · day ${e.day} · ${escapeHTML(e.chartConfig?.type || '?')} chart</span>
            <span class="portfolio-stars" aria-label="${e.stars} stars">${'★'.repeat(e.stars)}${'☆'.repeat(5 - e.stars)}</span>
            <button class="btn btn-secondary" data-portfolio-index="${index}" onclick="game.reopenPortfolioEntry(${index})">Reopen chart</button>
        </li>`).join('');
    return `
        <div class="portfolio-modal">
            <h2 id="modal-title">Career Portfolio</h2>
            <p>${stats.count} submissions · average ${stats.averageStars}★ · ${stats.fiveStar} five-star</p>
            <label>Domain
                <select id="portfolio-domain" onchange="game.showPortfolio(this.value)">${options}</select>
            </label>
            <ul class="portfolio-list">${rows || '<li>No submissions yet. Submit a chart to start your portfolio.</li>'}</ul>
            <button class="btn btn-secondary" onclick="game.exportPortfolio()">Export JSON</button>
            <button class="btn btn-primary" onclick="game.closeModal()">Close</button>
        </div>`;
}
