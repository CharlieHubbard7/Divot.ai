import { HANDICAP_RULES } from './constants.js';

/**
 * Utility functions for golf calculations and data processing
 */
export class GolfHelpers {
    /**
     * Calculate handicap differential
     * @param {number} score - Total score
     * @param {number} courseRating - Course rating
     * @param {number} slopeRating - Slope rating
     * @returns {number} Handicap differential
     */
    static calculateDifferential(score, courseRating, slopeRating) {
        return ((score - courseRating) * 113) / slopeRating;
    }

    /**
     * Calculate handicap index based on rounds
     * @param {Array} rounds - Array of round objects
     * @returns {number|null} Handicap index or null if insufficient rounds
     */
    static calculateHandicap(rounds) {
        if (rounds.length < 3) return null;

        const differentials = rounds
            .map(round => round.differential)
            .sort((a, b) => a - b);

        const rule = HANDICAP_RULES[Math.min(rounds.length, 20)];
        const roundsToCount = rule.count;

        const bestDifferentials = differentials.slice(0, roundsToCount);
        const average = bestDifferentials.reduce((sum, diff) => sum + diff, 0) / bestDifferentials.length;

        return Math.round(average * 10) / 10;
    }

    /**
     * Format date for display
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date string
     */
    static formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    /**
     * Calculate average from array of numbers
     * @param {Array} numbers - Array of numbers
     * @param {number} decimals - Number of decimal places
     * @returns {number} Average value
     */
    static calculateAverage(numbers, decimals = 1) {
        if (numbers.length === 0) return 0;
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        return Math.round((sum / numbers.length) * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    /**
     * Generate unique ID
     * @returns {number} Unique timestamp ID
     */
    static generateId() {
        return Date.now();
    }

    /**
     * Validate form input
     * @param {*} value - Value to validate
     * @param {Object} rules - Validation rules
     * @returns {boolean} Is valid
     */
    static validateInput(value, rules) {
        if (rules.min !== undefined && value < rules.min) return false;
        if (rules.max !== undefined && value > rules.max) return false;
        if (rules.required && (!value || value === '')) return false;
        return true;
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Get trend indicator for handicap
     * @param {Array} handicapHistory - Array of handicap values
     * @returns {string} Trend indicator
     */
    static getHandicapTrend(handicapHistory) {
        if (handicapHistory.length < 2) return 'stable';

        const recent = handicapHistory.slice(-3);
        const older = handicapHistory.slice(-6, -3);

        if (older.length === 0) return 'stable';

        const recentAvg = this.calculateAverage(recent);
        const olderAvg = this.calculateAverage(older);

        const difference = recentAvg - olderAvg;

        if (difference < -0.5) return 'improving';
        if (difference > 0.5) return 'declining';
        return 'stable';
    }
}
