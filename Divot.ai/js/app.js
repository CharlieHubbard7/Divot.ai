// Main Application Entry Point
import { TabManager } from './modules/TabManager.js';
import { HandicapCalculator } from './modules/HandicapCalculator.js';
import { ClaudeAPI } from './modules/ClaudeAPI.js';
import { StorageManager } from './utils/storage.js';
import { GolfHelpers } from './utils/helpers.js';
import { UIUtils } from './utils/ui.js';
import { APP_CONFIG, DEFAULT_SETTINGS } from './utils/constants.js';

/**
 * Main Golf Tracker Application
 */
class GolfTrackerApp {
    constructor() {
        this.sessions = [];
        this.rounds = [];
        this.settings = {};
        this.components = {};
        this.claudeAPI = new ClaudeAPI();

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.loadData();
            this.initializeComponents();
            this.bindGlobalEvents();
            this.initializeInteractiveFeatures();
            this.updateUI();

            console.log(`${APP_CONFIG.NAME} v${APP_CONFIG.VERSION} initialized successfully`);
        } catch (error) {
            console.error('Failed to initialize application:', error);
            UIUtils.showNotification('Failed to initialize application', 'error');
        }
    }

    /**
     * Load data from storage
     */
    loadData() {
        this.sessions = StorageManager.getSessions();
        this.rounds = StorageManager.getRounds();
        this.settings = { ...DEFAULT_SETTINGS, ...StorageManager.getSettings() };
    }

    /**
     * Initialize all components
     */
    initializeComponents() {
        // Initialize Tab Manager
        this.components.tabManager = new TabManager('.tab-navigation');
        this.components.tabManager.init();

        // Initialize Handicap Calculator
        this.components.handicapCalculator = new HandicapCalculator('#dashboard');
        this.components.handicapCalculator.update(this.rounds);
        this.components.handicapCalculator.init();

        // Set up tab change listener
        this.components.tabManager.on('tabChanged', (event) => {
            this.handleTabChange(event.detail.tabId);
        });
    }

    /**
     * Bind global event listeners
     */
    bindGlobalEvents() {
        // Practice Form
        const practiceForm = document.getElementById('practiceForm');
        if (practiceForm) {
            practiceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePracticeSubmit(e.target);
            });
        }

        // Round Form
        const roundForm = document.getElementById('roundForm');
        if (roundForm) {
            roundForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRoundSubmit(e.target);
            });
        }

        // Settings Form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSettingsSubmit(e.target);
            });
        }

        // AI Coaching
        this.initializeCoaching();
    }

    /**
     * Handle tab changes
     */
    handleTabChange(tabId) {
        switch (tabId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'practice':
                this.updatePracticeTab();
                break;
            case 'rounds':
                this.updateRoundsTab();
                break;
            case 'history':
                this.updateHistoryTab();
                break;
            case 'coaching':
                this.updateCoachingTab();
                break;
            case 'settings':
                this.updateSettingsTab();
                break;
        }
    }

    /**
     * Update dashboard with current data
     */
    updateDashboard() {
        this.updateStats();
        this.components.handicapCalculator.update(this.rounds);
    }

    /**
     * Update practice tab
     */
    updatePracticeTab() {
        this.renderSessions();
    }

    /**
     * Update rounds tab
     */
    updateRoundsTab() {
        this.renderRounds();
    }

    /**
     * Update history tab
     */
    updateHistoryTab() {
        this.renderSessions();
    }

    /**
     * Update coaching tab
     */
    updateCoachingTab() {
        // Coaching tab is already initialized
    }

    /**
     * Update settings tab
     */
    updateSettingsTab() {
        this.populateSettingsForm();
    }

    /**
     * Handle practice session submission
     */
    handlePracticeSubmit(form) {
        const session = {
            id: GolfHelpers.generateId(),
            date: form.date.value,
            duration: parseInt(form.duration.value),
            focus: form.focus.value,
            clubs: form.clubs.value,
            ballsHit: parseInt(form.ballsHit.value),
            summary: form.summary.value,
            rating: parseInt(form.rating.value)
        };

        this.sessions.unshift(session);
        this.saveSessions();
        this.updateUI();
        form.reset();

        // Set default values from settings
        form.duration.value = this.settings.defaultDuration;

        UIUtils.showNotification('Practice session logged successfully!', 'success');
        this.components.tabManager.setActiveTab('history');
    }

    /**
     * Handle round submission
     */
    handleRoundSubmit(form) {
        const round = {
            id: GolfHelpers.generateId(),
            date: form.roundDate.value,
            courseName: form.courseName.value,
            courseRating: parseFloat(form.courseRating.value),
            slopeRating: parseInt(form.slopeRating.value),
            totalScore: parseInt(form.totalScore.value),
            par: parseInt(form.par.value),
            weather: form.weather.value,
            notes: form.roundNotes.value,
            differential: GolfHelpers.calculateDifferential(
                parseInt(form.totalScore.value),
                parseFloat(form.courseRating.value),
                parseInt(form.slopeRating.value)
            )
        };

        this.rounds.unshift(round);
        this.saveRounds();
        this.updateUI();
        form.reset();

        UIUtils.showNotification('Round logged successfully!', 'success');
    }

    /**
     * Handle settings submission
     */
    handleSettingsSubmit(form) {
        this.settings = {
            defaultDuration: parseInt(form.defaultDuration.value),
            theme: form.theme.value,
            notifications: form.notifications.value
        };

        // Handle Claude API key
        const apiKey = form.claudeApiKey.value.trim();
        if (apiKey) {
            this.claudeAPI.setApiKey(apiKey);
            UIUtils.showNotification('Claude API key saved successfully!', 'success');
        }

        StorageManager.setSettings(this.settings);
        UIUtils.showNotification('Settings saved successfully!', 'success');
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        this.updateStats();
        this.renderSessions();
        this.renderRounds();
        this.components.handicapCalculator.update(this.rounds);
    }

    /**
     * Update statistics display
     */
    updateStats() {
        if (this.sessions.length === 0) return;

        const totalSessions = this.sessions.length;
        const totalMinutes = this.sessions.reduce((sum, session) => sum + session.duration, 0);
        const totalHours = GolfHelpers.calculateAverage([totalMinutes / 60], 1);
        const avgDuration = GolfHelpers.calculateAverage(this.sessions.map(s => s.duration));
        const avgRating = GolfHelpers.calculateAverage(this.sessions.map(s => s.rating));

        const elements = {
            totalSessions: document.getElementById('totalSessions'),
            totalHours: document.getElementById('totalHours'),
            avgDuration: document.getElementById('avgDuration'),
            avgRating: document.getElementById('avgRating')
        };

        if (elements.totalSessions) elements.totalSessions.textContent = totalSessions;
        if (elements.totalHours) elements.totalHours.textContent = totalHours;
        if (elements.avgDuration) elements.avgDuration.textContent = avgDuration;
        if (elements.avgRating) elements.avgRating.textContent = avgRating;
    }

    /**
     * Render practice sessions
     */
    renderSessions() {
        const sessionsList = document.getElementById('sessionsList');
        if (!sessionsList) return;

        if (this.sessions.length === 0) {
            sessionsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No practice sessions recorded yet</p>';
            return;
        }

        sessionsList.innerHTML = this.sessions.slice(0, APP_CONFIG.MAX_RECENT_SESSIONS).map(session => `
            <div class="session-item">
                <div class="session-item__header">
                    <div>
                        <h3 class="session-item__focus">${session.focus}</h3>
                        <p class="session-item__date">${GolfHelpers.formatDate(session.date)}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold);">
                            ${session.duration} mins
                        </p>
                        <p style="color: var(--color-primary);">
                            ${'⭐'.repeat(session.rating)}
                        </p>
                    </div>
                </div>
                <p class="session-item__summary">${session.summary}</p>
                <p class="session-item__details">
                    Clubs: ${session.clubs} • Balls Hit: ${session.ballsHit}
                </p>
            </div>
        `).join('');
    }

    /**
     * Render golf rounds
     */
    renderRounds() {
        const roundsList = document.getElementById('recentRounds');
        if (!roundsList) return;

        if (this.rounds.length === 0) {
            roundsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No rounds recorded yet</p>';
            return;
        }

        roundsList.innerHTML = this.rounds.slice(0, APP_CONFIG.MAX_RECENT_ROUNDS).map(round => `
            <div class="round-item">
                <div class="round-item__header">
                    <span class="round-item__course">${round.courseName}</span>
                    <span class="round-item__score">${round.totalScore}</span>
                </div>
                <div class="round-item__details">
                    <div>Date: ${GolfHelpers.formatDate(round.date)}</div>
                    <div>Par: ${round.par}</div>
                    <div>Rating: ${round.courseRating}</div>
                    <div>Slope: ${round.slopeRating}</div>
                    <div>Weather: ${round.weather}</div>
                    <div>Diff: ${round.differential.toFixed(1)}</div>
                </div>
                ${round.notes ? `<div class="round-item__notes">${round.notes}</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Initialize interactive features
     */
    initializeInteractiveFeatures() {
        this.createInteractiveCursor();
        this.createParticleSystem();
        this.addCardHoverEffects();
        this.updateHeaderStats();
    }

    /**
     * Create interactive cursor effect
     */
    createInteractiveCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'interactive-cursor';
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
            cursor.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });

        // Add glow effect on hover
        document.querySelectorAll('.card, .btn, .tab-btn').forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.style.background = 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)';
            });
            element.addEventListener('mouseleave', () => {
                cursor.style.background = 'radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)';
            });
        });
    }

    /**
     * Create particle system
     */
    createParticleSystem() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        document.body.appendChild(particlesContainer);

        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particlesContainer.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 10000);
        };

        // Create particles periodically
        setInterval(createParticle, 2000);
    }

    /**
     * Add card hover effects
     */
    addCardHoverEffects() {
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('glow-on-hover', 'tilt-3d');
        });

        document.querySelectorAll('.btn').forEach(btn => {
            btn.classList.add('ripple', 'smooth-transition');
        });
    }

    /**
     * Update header statistics
     */
    updateHeaderStats() {
        const headerSessions = document.getElementById('headerSessions');
        const headerRounds = document.getElementById('headerRounds');
        const headerHandicap = document.getElementById('headerHandicap');

        if (headerSessions) headerSessions.textContent = this.sessions.length;
        if (headerRounds) headerRounds.textContent = this.rounds.length;
        if (headerHandicap) {
            const handicap = GolfHelpers.calculateHandicap(this.rounds);
            headerHandicap.textContent = handicap ? handicap : 'N/A';
        }
    }

    /**
     * Initialize AI coaching interface
     */
    initializeCoaching() {
        const sendButton = document.getElementById('sendMessage');
        const input = document.getElementById('coachingInput');
        const actionCards = document.querySelectorAll('.action-card');

        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendCoachingMessage());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendCoachingMessage();
            });
        }

        actionCards.forEach(card => {
            card.addEventListener('click', () => {
                if (input) {
                    input.value = card.getAttribute('data-suggestion');
                    this.sendCoachingMessage();
                }
            });
        });
    }

    /**
     * Send coaching message
     */
    async sendCoachingMessage() {
        const input = document.getElementById('coachingInput');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        this.addMessageToChat(message, 'user');
        input.value = '';

        // Show loading message
        const loadingMessage = this.addMessageToChat('', 'ai', true);
        loadingMessage.querySelector('.message-text').innerHTML = '<span class="loading-dots">Thinking</span>';

        try {
            // Prepare context for Claude
            const context = {
                sessions: this.sessions,
                rounds: this.rounds,
                handicap: GolfHelpers.calculateHandicap(this.rounds)
            };

            let response;
            if (this.claudeAPI.hasApiKey()) {
                // Use Claude API
                response = await this.claudeAPI.sendMessage(message, context);
            } else {
                // Fallback to local response
                response = this.generateCoachingResponse(message);
            }

            // Remove loading message and add real response
            loadingMessage.remove();
            this.addMessageToChat(response, 'ai');

        } catch (error) {
            console.error('Coaching message error:', error);
            loadingMessage.remove();
            this.addMessageToChat(
                `Sorry, I encountered an error: ${error.message}. Please check your API key in settings.`,
                'ai'
            );
        }
    }

    /**
     * Add message to chat
     */
    addMessageToChat(message, sender, isLoading = false) {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message ${isLoading ? 'loading' : ''}`;

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <div class="avatar-circle small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="sender-name">${sender === 'ai' ? 'Claude AI' : 'You'}</span>
                    <span class="message-time">${timeString}</span>
                </div>
                <div class="message-text">${message}</div>
            </div>
        `;

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        return messageDiv;
    }

    /**
     * Generate coaching response
     */
    generateCoachingResponse(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('handicap') || lowerMessage.includes('trend')) {
            const handicap = GolfHelpers.calculateHandicap(this.rounds);
            if (handicap === null) {
                return "You need at least 3 rounds to establish a handicap. Keep playing and logging your rounds!";
            }
            return `Your current handicap is ${handicap}. Based on your ${this.rounds.length} rounds, you're showing good progress. Keep practicing to lower it further!`;
        }

        if (lowerMessage.includes('practice') || lowerMessage.includes('drill')) {
            const totalSessions = this.sessions.length;
            const avgRating = GolfHelpers.calculateAverage(this.sessions.map(s => s.rating));
            return `You've logged ${totalSessions} practice sessions with an average rating of ${avgRating}/5. Focus on your weakest areas and consider more targeted practice sessions.`;
        }

        if (lowerMessage.includes('weakness') || lowerMessage.includes('improve')) {
            const focusAreas = this.sessions.map(s => s.focus);
            const focusCounts = focusAreas.reduce((acc, focus) => {
                acc[focus] = (acc[focus] || 0) + 1;
                return acc;
            }, {});
            const leastPracticed = Object.keys(focusCounts).reduce((a, b) => focusCounts[a] < focusCounts[b] ? a : b);
            return `Based on your practice data, you might want to focus more on ${leastPracticed}. Consider dedicating more practice time to this area.`;
        }

        return "I'm here to help analyze your golf game! Ask me about your handicap, practice patterns, or specific areas for improvement. I can provide insights based on your logged data.";
    }

    /**
     * Populate settings form
     */
    populateSettingsForm() {
        const form = document.getElementById('settingsForm');
        if (!form) return;

        form.defaultDuration.value = this.settings.defaultDuration;
        form.theme.value = this.settings.theme;
        form.notifications.value = this.settings.notifications;

        // Load existing API key (masked)
        const existingKey = this.claudeAPI.getApiKey();
        if (existingKey) {
            form.claudeApiKey.placeholder = 'API key is set (enter new key to update)';
            form.claudeApiKey.value = '';
        }
    }

    /**
     * Save sessions to storage
     */
    saveSessions() {
        StorageManager.setSessions(this.sessions);
    }

    /**
     * Save rounds to storage
     */
    saveRounds() {
        StorageManager.setRounds(this.rounds);
    }

    /**
     * Export all data
     */
    exportData() {
        const data = {
            sessions: this.sessions,
            rounds: this.rounds,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `golf-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Clear all data
     */
    clearData() {
        if (confirm('Are you sure you want to clear all your golf data? This cannot be undone!')) {
            StorageManager.clearAll();
            this.sessions = [];
            this.rounds = [];
            this.settings = { ...DEFAULT_SETTINGS };
            this.updateUI();
            UIUtils.showNotification('All data has been cleared', 'success');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.golfTracker = new GolfTrackerApp();
});

// Add some CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
