// Application Constants
export const APP_CONFIG = {
    NAME: 'Golf Practice Tracker',
    VERSION: '2.0.0',
    MIN_ROUNDS_FOR_HANDICAP: 3,
    MAX_RECENT_ROUNDS: 5,
    MAX_RECENT_SESSIONS: 5,
    CHART_MAX_ROUNDS: 20
};

// Handicap calculation rules
export const HANDICAP_RULES = {
    1: { rounds: 1, count: 1 },
    2: { rounds: 2, count: 1 },
    3: { rounds: 3, count: 1 },
    4: { rounds: 4, count: 1 },
    5: { rounds: 5, count: 1 },
    6: { rounds: 6, count: 2 },
    7: { rounds: 7, count: 2 },
    8: { rounds: 8, count: 2 },
    9: { rounds: 9, count: 3 },
    10: { rounds: 10, count: 3 },
    11: { rounds: 11, count: 4 },
    12: { rounds: 12, count: 4 },
    13: { rounds: 13, count: 5 },
    14: { rounds: 14, count: 5 },
    15: { rounds: 15, count: 6 },
    16: { rounds: 16, count: 6 },
    17: { rounds: 17, count: 7 },
    18: { rounds: 18, count: 7 },
    19: { rounds: 19, count: 8 },
    20: { rounds: 20, count: 9 }
};

// Storage keys
export const STORAGE_KEYS = {
    SESSIONS: 'golf_sessions',
    ROUNDS: 'golf_rounds',
    SETTINGS: 'golf_settings'
};

// Default settings
export const DEFAULT_SETTINGS = {
    defaultDuration: 60,
    theme: 'dark',
    notifications: 'none'
};

// Form validation rules
export const VALIDATION_RULES = {
    SCORE: { min: 50, max: 200 },
    COURSE_RATING: { min: 60, max: 80 },
    SLOPE_RATING: { min: 55, max: 155 },
    PAR: { min: 60, max: 80 },
    DURATION: { min: 1, max: 300 },
    BALLS_HIT: { min: 1, max: 200 }
};
