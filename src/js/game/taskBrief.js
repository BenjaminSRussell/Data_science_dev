/**
 * Task brief: the comprehensive-task metadata (domain, tools, skills,
 * deliverable, real-world context) shown under the task description (#2430).
 */

const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const list = (items) => (Array.isArray(items) ? items.filter(Boolean).join(', ') : '');

/**
 * Build the brief rows for a task. Fields come from currentTask, falling back
 * to its template, so saved tasks without the copied fields still show them.
 * @returns {{label: string, value: string}[]}
 */
export function taskBriefRows(task) {
    if (!task) return [];
    const t = task.template || {};
    const domain = task.domain ?? t.domain;
    const subdomain = t.subdomain;
    const rows = [
        { label: 'Domain', value: [domain, subdomain].filter(Boolean).join(' / ') },
        { label: 'Tools', value: list(task.tools ?? t.tools) },
        { label: 'Skills', value: list(task.skills ?? t.skills) },
        { label: 'Deliverable', value: task.deliverable ?? t.deliverable ?? '' },
        { label: 'Context', value: task.realWorldContext ?? t.realWorldContext ?? '' },
    ];
    return rows.filter(row => row.value);
}

export function taskBriefHTML(task) {
    return taskBriefRows(task)
        .map(({ label, value }) =>
            `<div class="task-brief-row"><span class="task-brief-label">${label}</span> ${escapeHtml(value)}</div>`)
        .join('');
}

/**
 * Fill every .task-brief element on the page (hidden when there's nothing to show).
 */
export function renderTaskBrief(task, root = (typeof document !== 'undefined' ? document : null)) {
    if (!root) return;
    const html = taskBriefHTML(task);
    root.querySelectorAll('.task-brief').forEach(el => {
        el.innerHTML = html;
        el.hidden = !html;
    });
}
