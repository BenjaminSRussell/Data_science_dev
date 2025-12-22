/**
 * CodeCleanup.js
 * Utilities for code cleanup and optimization
 */

import { logger } from './Logger.js';
import { DOMUtils } from './DOMUtils.js';
import { CommonUtils } from './CommonUtils.js';

export class CodeCleanup {
    /**
     * Remove unused imports from file
     */
    static findUnusedImports(code) {
        // This would require AST parsing - simplified version
        const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
        const imports = [];
        let match;
        
        while ((match = importRegex.exec(code)) !== null) {
            imports.push(match[1]);
        }
        
        // Check if imports are used
        const unused = imports.filter(imp => {
            const importName = imp.split('/').pop().replace('.js', '');
            return !code.includes(importName) || code.indexOf(importName) === code.indexOf(`from '${imp}'`);
        });
        
        return unused;
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


