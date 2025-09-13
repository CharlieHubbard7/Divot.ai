import { BaseComponent } from './BaseComponent.js';
import { StorageManager } from '../utils/storage.js';

/**
 * Tab management component
 */
export class TabManager extends BaseComponent {
    getDefaultOptions() {
        return {
            activeTab: 'dashboard',
            persistActiveTab: true
        };
    }

    render() {
        this.tabButtons = this.container.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');

        this.initializeTabs();
    }

    bindEvents() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    initializeTabs() {
        // Restore last active tab if persistence is enabled
        if (this.options.persistActiveTab) {
            const lastActiveTab = StorageManager.get('lastActiveTab', this.options.activeTab);
            this.switchTab(lastActiveTab);
        } else {
            this.switchTab(this.options.activeTab);
        }
    }

    switchTab(tabId) {
        // Update button states
        this.tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            }
        });

        // Update content visibility
        this.tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });

        // Save active tab
        if (this.options.persistActiveTab) {
            StorageManager.set('lastActiveTab', tabId);
        }

        // Emit tab change event
        this.emit('tabChanged', { tabId });
    }

    getActiveTab() {
        const activeButton = this.container.querySelector('.tab-btn.active');
        return activeButton ? activeButton.getAttribute('data-tab') : null;
    }

    setActiveTab(tabId) {
        this.switchTab(tabId);
    }
}
