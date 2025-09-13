class GolfTracker {
    constructor() {
        this.initializeTabNavigation();
        this.initializeEventListeners();
        this.loadSettings();
        this.sessions = this.loadSessions();
        this.rounds = this.loadRounds();
        this.updateStats();
        this.updateHandicap();
        this.renderSessions();
        this.renderRounds();
        this.initializeCoaching();
    }

    initializeTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');

                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');

                // Save last active tab
                localStorage.setItem('lastActiveTab', tabId);
            });
        });

        // Restore last active tab
        const lastActiveTab = localStorage.getItem('lastActiveTab') || 'dashboard';
        document.querySelector(`[data-tab="${lastActiveTab}"]`).click();
    }

    initializeEventListeners() {
        // Practice Form
        document.getElementById('practiceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePracticeSubmit(e.target);
        });

        // Settings Form
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSettingsSubmit(e.target);
        });

        // Round Form
        document.getElementById('roundForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRoundSubmit(e.target);
        });
    }

    handlePracticeSubmit(form) {
        const session = {
            id: Date.now(),
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
        this.updateStats();
        this.renderSessions();

        form.reset();

        // Set default values from settings
        const settings = this.loadSettings();
        form.duration.value = settings.defaultDuration;

        // Show success message
        this.showNotification('Practice session logged successfully!', 'success');

        // Switch to history tab
        document.querySelector('[data-tab="history"]').click();
    }

    handleSettingsSubmit(form) {
        const settings = {
            defaultDuration: parseInt(form.defaultDuration.value),
            theme: form.theme.value,
            notifications: form.notifications.value
        };

        localStorage.setItem('settings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully!', 'success');
    }

    loadSettings() {
        const defaultSettings = {
            defaultDuration: 60,
            theme: 'light',
            notifications: 'none'
        };

        const settings = JSON.parse(localStorage.getItem('settings')) || defaultSettings;

        // Update form with current settings
        const form = document.getElementById('settingsForm');
        if (form) {
            form.defaultDuration.value = settings.defaultDuration;
            form.theme.value = settings.theme;
            form.notifications.value = settings.notifications;
        }

        return settings;
    }

    loadSessions() {
        return JSON.parse(localStorage.getItem('sessions')) || [];
    }

    saveSessions() {
        localStorage.setItem('sessions', JSON.stringify(this.sessions));
    }

    updateStats() {
        if (this.sessions.length === 0) return;

        const totalSessions = this.sessions.length;
        const totalMinutes = this.sessions.reduce((sum, session) => sum + session.duration, 0);
        const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
        const avgDuration = Math.round(totalMinutes / totalSessions);
        const avgRating = Math.round(this.sessions.reduce((sum, session) => sum + session.rating, 0) / totalSessions * 10) / 10;

        document.getElementById('totalSessions').textContent = totalSessions;
        document.getElementById('totalHours').textContent = totalHours;
        document.getElementById('avgDuration').textContent = avgDuration;
        document.getElementById('avgRating').textContent = avgRating;
    }

    renderSessions() {
        const sessionsList = document.getElementById('sessionsList');
        sessionsList.innerHTML = this.sessions.map(session => `
            <div class="card" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin-bottom: 0.5rem;">${session.focus}</h3>
                        <p style="color: var(--text-color); opacity: 0.8;">
                            ${new Date(session.date).toLocaleDateString()}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 1.2rem; font-weight: bold;">
                            ${session.duration} mins
                        </p>
                        <p style="color: var(--primary-color);">
                            ${'⭐'.repeat(session.rating)}
                        </p>
                    </div>
                </div>
                <p style="margin-top: 1rem; font-style: italic;">${session.summary}</p>
                <p style="margin-top: 0.5rem; color: var(--text-color); opacity: 0.8;">
                    Clubs: ${session.clubs} • Balls Hit: ${session.ballsHit}
                </p>
            </div>
        `).join('');
    }

    exportData() {
        const data = {
            sessions: this.sessions,
            settings: this.loadSettings(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `golf-practice-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearData() {
        if (confirm('Are you sure you want to clear all your practice data? This cannot be undone!')) {
            localStorage.removeItem('sessions');
            this.sessions = [];
            this.updateStats();
            this.renderSessions();
            this.showNotification('All practice data has been cleared', 'success');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 2rem;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px var(--shadow-color);
            animation: slideIn 0.3s ease;
            z-index: 1000;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // Round Management
    handleRoundSubmit(form) {
        const round = {
            id: Date.now(),
            date: form.roundDate.value,
            courseName: form.courseName.value,
            courseRating: parseFloat(form.courseRating.value),
            slopeRating: parseInt(form.slopeRating.value),
            totalScore: parseInt(form.totalScore.value),
            par: parseInt(form.par.value),
            weather: form.weather.value,
            notes: form.roundNotes.value,
            differential: this.calculateDifferential(parseInt(form.totalScore.value), parseFloat(form.courseRating.value), parseInt(form.slopeRating.value))
        };

        this.rounds.unshift(round);
        this.saveRounds();
        this.updateHandicap();
        this.renderRounds();
        this.updateHandicapChart();

        form.reset();
        this.showNotification('Round logged successfully!', 'success');
    }

    loadRounds() {
        return JSON.parse(localStorage.getItem('rounds')) || [];
    }

    saveRounds() {
        localStorage.setItem('rounds', JSON.stringify(this.rounds));
    }

    calculateDifferential(score, courseRating, slopeRating) {
        return ((score - courseRating) * 113) / slopeRating;
    }

    calculateHandicap() {
        if (this.rounds.length < 3) return null;

        // Sort differentials and take the best ones based on number of rounds
        const differentials = this.rounds.map(round => round.differential).sort((a, b) => a - b);

        let roundsToCount;
        if (this.rounds.length <= 5) roundsToCount = 1;
        else if (this.rounds.length <= 8) roundsToCount = 2;
        else if (this.rounds.length <= 10) roundsToCount = 3;
        else if (this.rounds.length <= 12) roundsToCount = 4;
        else if (this.rounds.length <= 14) roundsToCount = 5;
        else if (this.rounds.length <= 16) roundsToCount = 6;
        else if (this.rounds.length <= 18) roundsToCount = 7;
        else if (this.rounds.length <= 19) roundsToCount = 8;
        else roundsToCount = 9;

        const bestDifferentials = differentials.slice(0, roundsToCount);
        const average = bestDifferentials.reduce((sum, diff) => sum + diff, 0) / bestDifferentials.length;

        return Math.round(average * 10) / 10;
    }

    updateHandicap() {
        const handicap = this.calculateHandicap();
        const handicapElement = document.getElementById('currentHandicap');
        const trendElement = document.getElementById('handicapTrend');

        if (handicap !== null) {
            handicapElement.textContent = handicap;
            trendElement.innerHTML = `<span class="trend-text">Based on ${this.rounds.length} rounds</span>`;
        } else {
            handicapElement.textContent = 'N/A';
            trendElement.innerHTML = '<span class="trend-text">Need at least 3 rounds for handicap</span>';
        }
    }

    renderRounds() {
        const roundsList = document.getElementById('recentRounds');
        if (this.rounds.length === 0) {
            roundsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No rounds recorded yet</p>';
            return;
        }

        roundsList.innerHTML = this.rounds.slice(0, 5).map(round => `
            <div class="round-item">
                <div class="round-header">
                    <span class="round-course">${round.courseName}</span>
                    <span class="round-score">${round.totalScore}</span>
                </div>
                <div class="round-details">
                    <div>Date: ${new Date(round.date).toLocaleDateString()}</div>
                    <div>Par: ${round.par}</div>
                    <div>Rating: ${round.courseRating}</div>
                    <div>Slope: ${round.slopeRating}</div>
                    <div>Weather: ${round.weather}</div>
                    <div>Diff: ${round.differential.toFixed(1)}</div>
                </div>
                ${round.notes ? `<div style="margin-top: 0.5rem; font-style: italic; color: var(--text-secondary);">${round.notes}</div>` : ''}
            </div>
        `).join('');
    }

    updateHandicapChart() {
        const canvas = document.getElementById('handicapChart');
        if (!canvas || this.rounds.length < 3) return;

        const ctx = canvas.getContext('2d');
        const recentRounds = this.rounds.slice(0, 20).reverse(); // Last 20 rounds

        // Simple chart implementation
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 3;
        ctx.beginPath();

        const handicapHistory = [];
        for (let i = 2; i < recentRounds.length; i++) {
            const roundsForHandicap = recentRounds.slice(0, i + 1);
            const tempRounds = this.rounds.filter(r => roundsForHandicap.some(rr => rr.id === r.id));
            const handicap = this.calculateHandicapForRounds(tempRounds);
            if (handicap !== null) handicapHistory.push(handicap);
        }

        if (handicapHistory.length > 0) {
            const xStep = canvas.width / (handicapHistory.length - 1);
            const yMin = Math.min(...handicapHistory) - 2;
            const yMax = Math.max(...handicapHistory) + 2;
            const yRange = yMax - yMin;

            handicapHistory.forEach((handicap, index) => {
                const x = index * xStep;
                const y = canvas.height - ((handicap - yMin) / yRange) * canvas.height;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        }
    }

    calculateHandicapForRounds(rounds) {
        if (rounds.length < 3) return null;

        const differentials = rounds.map(round => round.differential).sort((a, b) => a - b);

        let roundsToCount;
        if (rounds.length <= 5) roundsToCount = 1;
        else if (rounds.length <= 8) roundsToCount = 2;
        else if (rounds.length <= 10) roundsToCount = 3;
        else if (rounds.length <= 12) roundsToCount = 4;
        else if (rounds.length <= 14) roundsToCount = 5;
        else if (rounds.length <= 16) roundsToCount = 6;
        else if (rounds.length <= 18) roundsToCount = 7;
        else if (rounds.length <= 19) roundsToCount = 8;
        else roundsToCount = 9;

        const bestDifferentials = differentials.slice(0, roundsToCount);
        const average = bestDifferentials.reduce((sum, diff) => sum + diff, 0) / bestDifferentials.length;

        return Math.round(average * 10) / 10;
    }

    // AI Coaching
    initializeCoaching() {
        const sendButton = document.getElementById('sendMessage');
        const input = document.getElementById('coachingInput');
        const suggestionButtons = document.querySelectorAll('.suggestion-btn');

        sendButton.addEventListener('click', () => this.sendCoachingMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendCoachingMessage();
        });

        suggestionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                input.value = btn.getAttribute('data-suggestion');
                this.sendCoachingMessage();
            });
        });
    }

    sendCoachingMessage() {
        const input = document.getElementById('coachingInput');
        const message = input.value.trim();
        if (!message) return;

        this.addMessageToChat(message, 'user');
        input.value = '';

        // Simulate AI response (replace with actual API call later)
        setTimeout(() => {
            const response = this.generateCoachingResponse(message);
            this.addMessageToChat(response, 'ai');
        }, 1000);
    }

    addMessageToChat(message, sender) {
        const chatContainer = document.getElementById('chatContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.innerHTML = `<div class="message-content"><strong>${sender === 'ai' ? 'AI Coach' : 'You'}:</strong> ${message}</div>`;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    generateCoachingResponse(message) {
        // Simple response generation based on data
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('handicap') || lowerMessage.includes('trend')) {
            const handicap = this.calculateHandicap();
            if (handicap === null) {
                return "You need at least 3 rounds to establish a handicap. Keep playing and logging your rounds!";
            }
            return `Your current handicap is ${handicap}. Based on your ${this.rounds.length} rounds, you're showing good progress. Keep practicing to lower it further!`;
        }

        if (lowerMessage.includes('practice') || lowerMessage.includes('drill')) {
            const totalSessions = this.sessions.length;
            const avgRating = this.sessions.reduce((sum, s) => sum + s.rating, 0) / this.sessions.length;
            return `You've logged ${totalSessions} practice sessions with an average rating of ${avgRating.toFixed(1)}/5. Focus on your weakest areas and consider more targeted practice sessions.`;
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
}

// Initialize the app
const golfTracker = new GolfTracker();

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