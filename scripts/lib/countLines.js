/**
 * Number of lines in a text. A trailing newline ends the last line; it does
 * not start a new, empty one, so "a\nb\n" is 2 lines like `wc -l` (#550).
 */
export function countLinesInText(content) {
    if (typeof content !== 'string' || content.length === 0) return 0;
    const lines = content.split(/\r\n|\n|\r/);
    if (lines[lines.length - 1] === '') lines.pop();
    return lines.length;
}
