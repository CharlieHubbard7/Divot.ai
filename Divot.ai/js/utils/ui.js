/**
 * UI utility functions for notifications, DOM manipulation, and user feedback
 */
export class UIUtils {
    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     * @param {number} duration - Display duration in milliseconds
     */
    static showNotification(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;

        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '1rem 2rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Set background color based on type
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            info: '#3B82F6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    /**
     * Create DOM element with attributes and content
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string} content - Element content
     * @returns {HTMLElement} Created element
     */
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);

        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });

        if (content) {
            element.textContent = content;
        }

        return element;
    }

    /**
     * Show loading state on element
     * @param {HTMLElement} element - Element to show loading on
     * @param {string} text - Loading text
     */
    static showLoading(element, text = 'Loading...') {
        element.dataset.originalContent = element.innerHTML;
        element.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div class="spinner"></div>
                <span>${text}</span>
            </div>
        `;
        element.disabled = true;
    }

    /**
     * Hide loading state on element
     * @param {HTMLElement} element - Element to hide loading on
     */
    static hideLoading(element) {
        if (element.dataset.originalContent) {
            element.innerHTML = element.dataset.originalContent;
            delete element.dataset.originalContent;
        }
        element.disabled = false;
    }

    /**
     * Smooth scroll to element
     * @param {HTMLElement} element - Element to scroll to
     * @param {number} offset - Offset from top
     */
    static scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Toggle element visibility
     * @param {HTMLElement} element - Element to toggle
     * @param {boolean} show - Whether to show or hide
     */
    static toggleVisibility(element, show) {
        element.style.display = show ? 'block' : 'none';
    }

    /**
     * Add CSS animation to element
     * @param {HTMLElement} element - Element to animate
     * @param {string} animation - Animation class name
     * @param {number} duration - Animation duration in ms
     */
    static animateElement(element, animation, duration = 300) {
        element.classList.add(animation);
        setTimeout(() => {
            element.classList.remove(animation);
        }, duration);
    }

    /**
     * Format number with proper precision
     * @param {number} num - Number to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number
     */
    static formatNumber(num, decimals = 1) {
        return Number(num).toFixed(decimals);
    }

    /**
     * Create progress bar
     * @param {number} current - Current value
     * @param {number} max - Maximum value
     * @param {string} color - Progress bar color
     * @returns {HTMLElement} Progress bar element
     */
    static createProgressBar(current, max, color = '#4169E1') {
        const percentage = Math.min((current / max) * 100, 100);

        const container = this.createElement('div', {
            className: 'progress-bar',
            style: `
                width: 100%;
                height: 8px;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
            `
        });

        const fill = this.createElement('div', {
            className: 'progress-fill',
            style: `
                width: ${percentage}%;
                height: 100%;
                background-color: ${color};
                transition: width 0.3s ease;
            `
        });

        container.appendChild(fill);
        return container;
    }
}
