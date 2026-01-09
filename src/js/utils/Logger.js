/**
 * Logger.js
 * Centralized logging system
 * Replaces 218 console.log/warn/error statements
 * Allows for log levels and production mode
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

class Logger {
    constructor() {
        this.level = process.env.NODE_ENV === 'production' ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;
        this.enabled = true;
    }

    /**
     * Set log level
     */
    setLevel(level) {
        if (typeof level === 'string') {
            this.level = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
        } else {
            this.level = level;
        }
    }

    /**
     * Enable/disable logging
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Debug log
     */
    debug(...args) {
        if (this.enabled && this.level <= LOG_LEVELS.DEBUG) {
            console.debug('[DEBUG]', ...args);
        }
    }

    /**
     * Info log
     */
    info(...args) {
        if (this.enabled && this.level <= LOG_LEVELS.INFO) {
            console.info('[INFO]', ...args);
        }
    }

    /**
     * Warn log
     */
    warn(...args) {
        if (this.enabled && this.level <= LOG_LEVELS.WARN) {
            console.warn('[WARN]', ...args);
        }
    }

    /**
     * Error log
     */
    error(...args) {
        if (this.enabled && this.level <= LOG_LEVELS.ERROR) {
            console.error('[ERROR]', ...args);
        }
    }

    /**
     * Group logs
     */
    group(label) {
        if (this.enabled) {
            console.group(label);
        }
    }

    groupEnd() {
        if (this.enabled) {
            console.groupEnd();
        }
    }

    /**
     * Time measurement
     */
    time(label) {
        if (this.enabled) {
            console.time(label);
        }
    }

    timeEnd(label) {
        if (this.enabled) {
            console.timeEnd(label);
        }
    }
}

// Export singleton instance
export const logger = new Logger();

// Export class for custom instances
export { Logger, LOG_LEVELS };



