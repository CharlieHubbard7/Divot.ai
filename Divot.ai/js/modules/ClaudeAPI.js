import { UIUtils } from '../utils/ui.js';

/**
 * Claude API Integration for AI Coaching
 */
export class ClaudeAPI {
    constructor() {
        this.apiKey = null;
        this.baseURL = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-sonnet-20240229';
        this.maxTokens = 1000;
    }

    /**
     * Set the API key
     * @param {string} apiKey - Claude API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        // Store in localStorage for persistence
        localStorage.setItem('claude_api_key', apiKey);
    }

    /**
     * Get stored API key
     * @returns {string|null} API key or null
     */
    getApiKey() {
        if (!this.apiKey) {
            this.apiKey = localStorage.getItem('claude_api_key');
        }
        return this.apiKey;
    }

    /**
     * Check if API key is set
     * @returns {boolean} True if API key is available
     */
    hasApiKey() {
        return !!this.getApiKey();
    }

    /**
     * Send message to Claude API
     * @param {string} message - User message
     * @param {Object} context - Golf data context
     * @returns {Promise<string>} Claude's response
     */
    async sendMessage(message, context = {}) {
        if (!this.hasApiKey()) {
            throw new Error('Claude API key not set. Please add your API key in settings.');
        }

        const systemPrompt = this.buildSystemPrompt(context);

        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: this.maxTokens,
                    system: systemPrompt,
                    messages: [
                        {
                            role: 'user',
                            content: message
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Claude API error: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            return data.content[0].text;

        } catch (error) {
            console.error('Claude API Error:', error);
            throw error;
        }
    }

    /**
     * Build system prompt with golf context
     * @param {Object} context - Golf data context
     * @returns {string} System prompt
     */
    buildSystemPrompt(context) {
        const { sessions = [], rounds = [], handicap = null } = context;

        let prompt = `You are Claude, an expert AI golf coach and analyst. You help golfers improve their game through data-driven insights and personalized advice.

Your expertise includes:
- Golf swing mechanics and technique
- Course management and strategy
- Practice routines and drills
- Mental game and course psychology
- Equipment recommendations
- Handicap analysis and improvement strategies

Current golfer data:
- Practice Sessions: ${sessions.length} total
- Rounds Played: ${rounds.length} total
- Current Handicap: ${handicap || 'Not established (need 3+ rounds)'}

Recent Practice Focus Areas: ${this.getPracticeFocusAreas(sessions)}
Recent Round Performance: ${this.getRoundPerformance(rounds)}

Guidelines for responses:
1. Be encouraging and positive while being honest about areas for improvement
2. Provide specific, actionable advice based on the data provided
3. Use golf terminology appropriately but explain complex concepts clearly
4. Suggest specific drills or practice routines when relevant
5. Reference the golfer's actual data when making recommendations
6. Keep responses concise but comprehensive (aim for 2-3 paragraphs)
7. Ask follow-up questions to better understand their goals when appropriate

Always base your advice on the actual data provided and be specific about what the numbers mean for their game.`;

        return prompt;
    }

    /**
     * Get practice focus areas from sessions
     * @param {Array} sessions - Practice sessions
     * @returns {string} Focus areas summary
     */
    getPracticeFocusAreas(sessions) {
        if (sessions.length === 0) return 'No practice data available';

        const focusCounts = sessions.reduce((acc, session) => {
            acc[session.focus] = (acc[session.focus] || 0) + 1;
            return acc;
        }, {});

        const sortedFocus = Object.entries(focusCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([focus, count]) => `${focus} (${count} sessions)`)
            .join(', ');

        return sortedFocus || 'No focus areas recorded';
    }

    /**
     * Get round performance summary
     * @param {Array} rounds - Golf rounds
     * @returns {string} Performance summary
     */
    getRoundPerformance(rounds) {
        if (rounds.length === 0) return 'No round data available';

        const recentRounds = rounds.slice(0, 5);
        const avgScore = recentRounds.reduce((sum, round) => sum + round.totalScore, 0) / recentRounds.length;
        const avgDifferential = recentRounds.reduce((sum, round) => sum + round.differential, 0) / recentRounds.length;

        return `Average score: ${avgScore.toFixed(1)}, Average differential: ${avgDifferential.toFixed(1)}`;
    }

    /**
     * Generate quick insights based on data
     * @param {Object} context - Golf data context
     * @returns {Promise<string>} Quick insights
     */
    async getQuickInsights(context) {
        const insights = [];
        const { sessions = [], rounds = [], handicap = null } = context;

        // Practice frequency insight
        if (sessions.length > 0) {
            const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
            const avgRating = sessions.reduce((sum, s) => sum + s.rating, 0) / sessions.length;

            if (totalHours < 10) {
                insights.push("Consider increasing your practice frequency for better improvement.");
            } else if (avgRating < 3) {
                insights.push("Your practice sessions could benefit from more focused, quality practice.");
            } else {
                insights.push("Great practice consistency! Keep up the good work.");
            }
        }

        // Handicap trend insight
        if (handicap !== null && rounds.length >= 3) {
            if (handicap < 10) {
                insights.push("Excellent handicap! Focus on course management and short game refinement.");
            } else if (handicap < 20) {
                insights.push("Good progress! Work on consistency and course management.");
            } else {
                insights.push("Focus on fundamentals and consistent ball-striking to lower your handicap.");
            }
        }

        // Round performance insight
        if (rounds.length > 0) {
            const recentRounds = rounds.slice(0, 3);
            const avgDifferential = recentRounds.reduce((sum, r) => sum + r.differential, 0) / recentRounds.length;

            if (avgDifferential < 5) {
                insights.push("Outstanding recent performance! You're playing at a high level.");
            } else if (avgDifferential < 15) {
                insights.push("Solid recent rounds. Focus on eliminating big numbers.");
            } else {
                insights.push("Recent rounds show room for improvement. Focus on course management.");
            }
        }

        return insights.length > 0 ? insights.join(' ') : "Keep practicing and logging your sessions to get personalized insights!";
    }

    /**
     * Test API connection
     * @returns {Promise<boolean>} True if connection successful
     */
    async testConnection() {
        try {
            await this.sendMessage("Hello, are you working?", {});
            return true;
        } catch (error) {
            console.error('Claude API connection test failed:', error);
            return false;
        }
    }

    /**
     * Clear stored API key
     */
    clearApiKey() {
        this.apiKey = null;
        localStorage.removeItem('claude_api_key');
    }
}

