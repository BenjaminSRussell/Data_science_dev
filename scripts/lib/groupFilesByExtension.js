/**
 * Group files by their extension.
 *
 * Files that have no extension (or a falsy extension) are grouped under the
 * '(no extension)' bucket.
 *
 * @param {Array<{extension?: string, size?: number}>} files - files to group
 * @returns {Object<string, Array>} a map from extension to the array of files
 *   that share that extension
 */
export function groupFilesByExtension(files) {
    const filesByExt = {};
    files.forEach(file => {
        const ext = file.extension || '(no extension)';
        if (!filesByExt[ext]) {
            filesByExt[ext] = [];
        }
        filesByExt[ext].push(file);
    });
    return filesByExt;
}
