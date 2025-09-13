import { BaseComponent } from './BaseComponent.js';
import { GolfHelpers } from '../utils/helpers.js';
import { UIUtils } from '../utils/ui.js';

/**
 * Handicap calculation and display component
 */
export class HandicapCalculator extends BaseComponent {
    getDefaultOptions() {
        return {
            showChart: true,
            chartHeight: 200
        };
    }

    render() {
        this.handicapElement = document.getElementById('currentHandicap');
        this.trendElement = document.getElementById('handicapTrend');
        this.chartCanvas = document.getElementById('handicapChart');

        this.updateDisplay();
        if (this.options.showChart) {
            this.updateChart();
        }
    }

    updateDisplay() {
        if (!this.data || this.data.length === 0) {
            this.handicapElement.textContent = 'N/A';
            this.trendElement.innerHTML = '<span class="trend-text">No rounds recorded yet</span>';
            return;
        }

        const handicap = GolfHelpers.calculateHandicap(this.data);

        if (handicap !== null) {
            this.handicapElement.textContent = handicap;
            this.trendElement.innerHTML = `<span class="trend-text">Based on ${this.data.length} rounds</span>`;
        } else {
            this.handicapElement.textContent = 'N/A';
            this.trendElement.innerHTML = '<span class="trend-text">Need at least 3 rounds for handicap</span>';
        }
    }

    updateChart() {
        if (!this.chartCanvas || !this.data || this.data.length < 3) {
            return;
        }

        const ctx = this.chartCanvas.getContext('2d');
        const recentRounds = this.data.slice(0, 20).reverse();

        // Clear canvas
        ctx.clearRect(0, 0, this.chartCanvas.width, this.chartCanvas.height);

        // Calculate handicap history
        const handicapHistory = [];
        for (let i = 2; i < recentRounds.length; i++) {
            const roundsForHandicap = recentRounds.slice(0, i + 1);
            const handicap = GolfHelpers.calculateHandicap(roundsForHandicap);
            if (handicap !== null) {
                handicapHistory.push(handicap);
            }
        }

        if (handicapHistory.length === 0) return;

        // Draw chart
        this.drawChart(ctx, handicapHistory);
    }

    drawChart(ctx, handicapHistory) {
        const padding = 20;
        const chartWidth = this.chartCanvas.width - (padding * 2);
        const chartHeight = this.chartCanvas.height - (padding * 2);

        // Set up chart area
        const yMin = Math.min(...handicapHistory) - 2;
        const yMax = Math.max(...handicapHistory) + 2;
        const yRange = yMax - yMin;

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }

        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = padding + (chartWidth / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, padding + chartHeight);
            ctx.stroke();
        }

        // Draw handicap line
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 3;
        ctx.beginPath();

        handicapHistory.forEach((handicap, index) => {
            const x = padding + (chartWidth / (handicapHistory.length - 1)) * index;
            const y = padding + chartHeight - ((handicap - yMin) / yRange) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw data points
        ctx.fillStyle = '#4169E1';
        handicapHistory.forEach((handicap, index) => {
            const x = padding + (chartWidth / (handicapHistory.length - 1)) * index;
            const y = padding + chartHeight - ((handicap - yMin) / yRange) * chartHeight;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';

        // Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const value = yMax - (yRange / 5) * i;
            const y = padding + (chartHeight / 5) * i;
            ctx.fillText(value.toFixed(1), padding - 10, y + 4);
        }
    }

    getCurrentHandicap() {
        return this.data ? GolfHelpers.calculateHandicap(this.data) : null;
    }

    getHandicapTrend() {
        if (!this.data || this.data.length < 6) return 'stable';

        const handicapHistory = [];
        for (let i = 2; i < this.data.length; i++) {
            const roundsForHandicap = this.data.slice(0, i + 1);
            const handicap = GolfHelpers.calculateHandicap(roundsForHandicap);
            if (handicap !== null) {
                handicapHistory.push(handicap);
            }
        }

        return GolfHelpers.getHandicapTrend(handicapHistory);
    }
}
