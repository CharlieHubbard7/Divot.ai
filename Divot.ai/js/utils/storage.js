import { STORAGE_KEYS } from './constants.js';

/**
 * Storage utility class for managing localStorage operations
 */
export class StorageManager {
    /**
     * Get data from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Parsed data or default value
     */
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage for key ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Set data in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Clear all golf-related data
     * @returns {boolean} Success status
     */
    static clearAll() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // Specific getters for golf data
    static getSessions() {
        return this.get(STORAGE_KEYS.SESSIONS, []);
    }

    static getRounds() {
        return this.get(STORAGE_KEYS.ROUNDS, []);
    }

    static getSettings() {
        return this.get(STORAGE_KEYS.SETTINGS, {});
    }

    // Specific setters for golf data
    static setSessions(sessions) {
        return this.set(STORAGE_KEYS.SESSIONS, sessions);
    }

    static setRounds(rounds) {
        return this.set(STORAGE_KEYS.ROUNDS, rounds);
    }

    static setSettings(settings) {
        return this.set(STORAGE_KEYS.SETTINGS, settings);
    }
}
