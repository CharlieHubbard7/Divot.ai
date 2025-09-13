import { UIUtils } from '../utils/ui.js';

/**
 * Base component class for all UI components
 */
export class BaseComponent {
    constructor(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;
        this.options = { ...this.getDefaultOptions(), ...options };
        this.isInitialized = false;
    }

    /**
     * Get default options for the component
     * @returns {Object} Default options
     */
    getDefaultOptions() {
        return {};
    }

    /**
     * Initialize the component
     */
    init() {
        if (this.isInitialized) return;
        this.render();
        this.bindEvents();
        this.isInitialized = true;
    }

    /**
     * Render the component (to be implemented by subclasses)
     */
    render() {
        throw new Error('render() method must be implemented by subclass');
    }

    /**
     * Bind event listeners (to be implemented by subclasses)
     */
    bindEvents() {
        // To be implemented by subclasses
    }

    /**
     * Update the component with new data
     * @param {*} data - New data
     */
    update(data) {
        this.data = data;
        this.render();
    }

    /**
     * Destroy the component and clean up
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.isInitialized = false;
    }

    /**
     * Show loading state
     */
    showLoading() {
        UIUtils.showLoading(this.container);
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        UIUtils.hideLoading(this.container);
    }

    /**
     * Emit custom event
     * @param {string} eventName - Event name
     * @param {*} detail - Event detail
     */
    emit(eventName, detail = null) {
        const event = new CustomEvent(eventName, { detail });
        this.container.dispatchEvent(event);
    }

    /**
     * Listen for custom events
     * @param {string} eventName - Event name
     * @param {Function} handler - Event handler
     */
    on(eventName, handler) {
        this.container.addEventListener(eventName, handler);
    }
}
