/**
 * CodeCleanup.js
 * Utilities for code cleanup and optimization
 */

import { logger } from './Logger.js';
import { DOMUtils } from './DOMUtils.js';

export class CodeCleanup {
    /**
     * Remove unused imports from file
     */
    static findUnusedImports(code) {
        // Regex-level check (no AST): collect the identifiers each import binds
        // and report the import's path when none of them is used outside the
        // import statements themselves (#2478). The old check looked for the
        // file's basename and its second branch could never be true.
        const src = String(code || '');
        const importRegex = /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"];?/g;
        const imports = [];
        let match;
        while ((match = importRegex.exec(src)) !== null) {
            imports.push({ clause: match[1], path: match[2] });
        }
        const body = src.replace(importRegex, ' ');
        const isUsed = (name) => new RegExp(`(^|[^\\w$.])${name.replace(/\$/g, '\\$')}([^\\w$]|$)`).test(body);

        return imports
            .filter(({ clause }) => {
                const names = CodeCleanup.importedNames(clause);
                return names.length > 0 && !names.some(isUsed);
            })
            .map(({ path }) => path);
    }

    /**
     * Local names bound by an import clause:
     * `X`, `{ a, b as c }`, `* as ns`, `X, { a }`
     */
    static importedNames(clause) {
        const names = [];
        const text = String(clause || '').trim();
        const braces = text.match(/\{([\s\S]*?)\}/);
        if (braces) {
            braces[1].split(',').map(s => s.trim()).filter(Boolean).forEach(part => {
                const alias = part.split(/\s+as\s+/);
                names.push((alias[1] || alias[0]).trim());
            });
        }
        const ns = text.match(/\*\s+as\s+([\w$]+)/);
        if (ns) names.push(ns[1]);
        const outside = text.replace(/\{[\s\S]*?\}/, '').replace(/\*\s+as\s+[\w$]+/, '');
        outside.split(',').map(s => s.trim()).filter(s => /^[\w$]+$/.test(s)).forEach(n => names.push(n));
        return names.filter(n => /^[\w$]+$/.test(n));
    }

    /**
     * Find duplicate code patterns
     */
    static findDuplicates(files) {
        const patterns = new Map();
        
        files.forEach(file => {
            // Simple pattern detection - look for repeated function structures
            const functionPattern = /function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\}/g;
            let match;
            
            while ((match = functionPattern.exec(file.content)) !== null) {
                const funcName = match[1];
                if (!patterns.has(funcName)) {
                    patterns.set(funcName, []);
                }
                patterns.get(funcName).push(file.path);
            }
        });
        
        // Return functions that appear in multiple files
        const duplicates = [];
        patterns.forEach((files, funcName) => {
            if (files.length > 1) {
                duplicates.push({ funcName, files });
            }
        });
        
        return duplicates;
    }

    /**
     * Optimize DOM queries
     */
    static optimizeDOMQueries(code) {
        // Replace repeated querySelector with cached version
        const repeatedQueries = /document\.querySelector\(['"](.*?)['"]\)/g;
        const queryCache = new Map();
        
        return code.replace(repeatedQueries, (match, selector) => {
            if (!queryCache.has(selector)) {
                queryCache.set(selector, `DOMUtils.query('${selector}')`);
            }
            return queryCache.get(selector);
        });
    }

    /**
     * Replace console statements with logger
     */
    static replaceConsoleStatements(code) {
        return code
            .replace(/console\.log\(/g, 'logger.debug(')
            .replace(/console\.info\(/g, 'logger.info(')
            .replace(/console\.warn\(/g, 'logger.warn(')
            .replace(/console\.error\(/g, 'logger.error(');
    }

    /**
     * Replace document.createElement with DOMUtils
     */
    static replaceDOMCreation(code) {
        // Pattern: const el = document.createElement('div');
        const pattern = /const\s+(\w+)\s*=\s*document\.createElement\(['"](.*?)['"]\)/g;
        
        return code.replace(pattern, (match, varName, tag) => {
            return `const ${varName} = DOMUtils.createElement('${tag}')`;
        });
    }

    /**
     * Find dead code (unused functions)
     */
    static findDeadCode(code, exports) {
        const functionRegex = /(?:function|const|export\s+function)\s+(\w+)/g;
        const functions = [];
        let match;
        
        while ((match = functionRegex.exec(code)) !== null) {
            functions.push(match[1]);
        }
        
        // Check if functions are used
        const unused = functions.filter(func => {
            // Skip if exported
            if (exports.includes(func)) return false;
            
            // Count occurrences (should be at least 2: definition + usage)
            const regex = new RegExp(`\\b${func}\\b`, 'g');
            const matches = code.match(regex);
            return matches && matches.length === 1;
        });
        
        return unused;
    }
}



