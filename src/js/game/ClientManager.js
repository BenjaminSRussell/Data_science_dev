/**
 * ClientManager - Handles client acquisition and job pipeline
 * Clients bring you data, you process it for payment
 */

import { CLIENT_TYPES, MARKETING_CHANNELS } from '../data/tycoonData.js';

export class ClientManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.activeClients = [];
        this.pendingJobs = [];
        this.completedJobs = [];
        this.marketingActive = ['word_of_mouth'];
    }

    /**
     * Generate new client leads based on marketing
     */
    generateLeads() {
        let totalLeads = 0;

        // Calculate leads from all active marketing channels
        for (const channelId of this.marketingActive) {
            const channel = MARKETING_CHANNELS.find(m => m.id === channelId);
            if (channel) {
                totalLeads += channel.leadsPerDay;
            }
        }

        // Add office bonus
        const office = this.gameState.currentOffice;
        if (office) {
            totalLeads *= (1 + office.clientBonus);
        }

        // Convert to actual client (probabilistic)
        const newClients = Math.floor(totalLeads);
        const fractional = totalLeads - newClients;

        const finalClients = newClients + (Math.random() < fractional ? 1 : 0);

        for (let i = 0; i < finalClients; i++) {
            this.generateClient();
        }

        return finalClients;
    }

    /**
     * Generate a new client based on player's reputation
     */
    generateClient() {
        // Higher reputation = access to better clients
        const availableClients = CLIENT_TYPES.filter(c =>
            c.dataComplexity <= Math.ceil(this.gameState.rankIndex / 2) + 1
        );

        if (availableClients.length === 0) {
            return null;
        }

        const clientType = availableClients[Math.floor(Math.random() * availableClients.length)];

        // Generate job offer
        const job = this.generateJob(clientType);

        this.pendingJobs.push(job);

        // Dispatch event for UI
        window.dispatchEvent(new CustomEvent('newjob', { detail: job }));

        return job;
    }

    /**
     * Generate a job from a client
     */
    generateJob(clientType) {
        const jobTypes = [
            "Sales Dashboard",
            "Monthly Report",
            "Customer Analysis",
            "Performance Metrics",
            "Financial Summary",
            "Marketing Analytics",
            "User Behavior Report",
            "Inventory Analysis",
            "Revenue Forecast",
            "KPI Dashboard"
        ];

        const urgencyLevels = ['relaxed', 'normal', 'urgent', 'critical'];
        const urgency = urgencyLevels[Math.floor(Math.random() * Math.min(4, clientType.dataComplexity + 1))];

        const baseTime = {
            relaxed: 300,
            normal: 180,
            urgent: 120,
            critical: 60
        };

        return {
            id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            clientType: clientType,
            title: jobTypes[Math.floor(Math.random() * jobTypes.length)],
            description: `${clientType.name} needs a ${jobTypes[Math.floor(Math.random() * jobTypes.length)].toLowerCase()}`,
            payment: Math.floor(
                clientType.minPay + Math.random() * (clientType.maxPay - clientType.minPay)
            ),
            urgency: urgency,
            complexity: clientType.dataComplexity,
            data: null, // Data is assigned when job is accepted
            status: 'pending',
            createdAt: Date.now(),
            expiresAt: Date.now() + (1000 * 60 * 5), // 5 minute window to accept
            progress: 0
        };
    }

    /**
     * Accept a job
     */
    acceptJob(jobId) {
        const jobIndex = this.pendingJobs.findIndex(j => j.id === jobId);
        if (jobIndex === -1) return null;

        const job = this.pendingJobs.splice(jobIndex, 1)[0];
        job.status = 'active';
        job.acceptedAt = Date.now();

        // Generate data for this job
        job.data = this.generateJobData(job);

        this.activeClients.push(job);

        window.dispatchEvent(new CustomEvent('jobaccepted', { detail: job }));

        return job;
    }

    /**
     * Decline a job
     */
    declineJob(jobId) {
        const jobIndex = this.pendingJobs.findIndex(j => j.id === jobId);
        if (jobIndex !== -1) {
            this.pendingJobs.splice(jobIndex, 1);
        }
    }

    /**
     * Generate data for an accepted job
     */
    generateJobData(job) {
        const dataTypes = {
            1: this.generateSimpleData,
            2: this.generateMediumData,
            3: this.generateComplexData,
            4: this.generateEnterpriseData
        };

        const generator = dataTypes[job.complexity] || this.generateSimpleData;
        return generator.call(this);
    }

    generateSimpleData() {
        const labels = ['Jan', 'Feb', 'Mar', 'Apr'];
        return {
            columns: ['Month', 'Value'],
            rows: labels.map(l => [l, Math.floor(1000 + Math.random() * 5000)]),
            labels: labels,
            datasets: {
                Value: labels.map(() => Math.floor(1000 + Math.random() * 5000))
            }
        };
    }

    generateMediumData() {
        const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        const revenue = labels.map(() => Math.floor(10000 + Math.random() * 50000));
        const expenses = revenue.map(r => Math.floor(r * (0.4 + Math.random() * 0.3)));

        return {
            columns: ['Quarter', 'Revenue', 'Expenses', 'Profit'],
            rows: labels.map((l, i) => [l, revenue[i], expenses[i], revenue[i] - expenses[i]]),
            labels: labels,
            datasets: {
                Revenue: revenue,
                Expenses: expenses,
                Profit: revenue.map((r, i) => r - expenses[i])
            }
        };
    }

    generateComplexData() {
        const categories = ['Online', 'Retail', 'Wholesale', 'B2B', 'International'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

        return {
            columns: ['Month', ...categories],
            rows: months.map(m => [
                m,
                ...categories.map(() => Math.floor(5000 + Math.random() * 20000))
            ]),
            labels: months,
            datasets: Object.fromEntries(
                categories.map(c => [c, months.map(() => Math.floor(5000 + Math.random() * 20000))])
            )
        };
    }

    generateEnterpriseData() {
        const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Africa'];
        const products = ['Product A', 'Product B', 'Product C', 'Product D'];

        return {
            columns: ['Region', ...products, 'Total'],
            rows: regions.map(r => {
                const values = products.map(() => Math.floor(50000 + Math.random() * 200000));
                return [r, ...values, values.reduce((a, b) => a + b, 0)];
            }),
            labels: regions,
            datasets: Object.fromEntries(
                products.map(p => [p, regions.map(() => Math.floor(50000 + Math.random() * 200000))])
            )
        };
    }

    /**
     * Update job progress
     */
    updateJobProgress(jobId, progress) {
        const job = this.activeClients.find(j => j.id === jobId);
        if (job) {
            job.progress = Math.min(100, progress);

            if (job.progress >= 100) {
                this.completeJob(jobId);
            }
        }
    }

    /**
     * Complete a job
     */
    completeJob(jobId) {
        const jobIndex = this.activeClients.findIndex(j => j.id === jobId);
        if (jobIndex === -1) return null;

        const job = this.activeClients.splice(jobIndex, 1)[0];
        job.status = 'completed';
        job.completedAt = Date.now();

        this.completedJobs.push(job);

        window.dispatchEvent(new CustomEvent('jobcompleted', { detail: job }));

        return job;
    }

    /**
     * Get active job count
     */
    getActiveJobCount() {
        return this.activeClients.length;
    }

    /**
     * Get pending job count
     */
    getPendingJobCount() {
        return this.pendingJobs.length;
    }

    /**
     * Calculate daily marketing cost
     */
    getDailyMarketingCost() {
        return this.marketingActive.reduce((total, channelId) => {
            const channel = MARKETING_CHANNELS.find(m => m.id === channelId);
            return total + (channel?.costPerDay || 0);
        }, 0);
    }

    /**
     * Activate a marketing channel
     */
    activateMarketing(channelId) {
        if (!this.marketingActive.includes(channelId)) {
            this.marketingActive.push(channelId);
        }
    }

    /**
     * Deactivate a marketing channel
     */
    deactivateMarketing(channelId) {
        const index = this.marketingActive.indexOf(channelId);
        if (index !== -1) {
            this.marketingActive.splice(index, 1);
        }
    }

    /**
     * Clean up expired pending jobs
     */
    cleanupExpiredJobs() {
        const now = Date.now();
        this.pendingJobs = this.pendingJobs.filter(job => job.expiresAt > now);
    }
}
