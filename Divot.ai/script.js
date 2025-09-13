class GolfTracker {
    constructor() {
        this.initializeTabNavigation();
        this.initializeEventListeners();
        this.loadSettings();
        this.sessions = this.loadSessions();
        this.updateStats();
        this.renderSessions();
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