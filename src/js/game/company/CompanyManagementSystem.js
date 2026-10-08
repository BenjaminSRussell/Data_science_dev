/**
 * CompanyManagementSystem.js
 * Manages company creation, hiring, skills, tasks, and workers
 */

import { pickState, applyState } from '../../utils/StateSerializer.js';

export class CompanyManagementSystem {
    /** Staff headcount cap (#1402) */
    static MAX_EMPLOYEES = 10;
    /** Floor so a zero-skill hire still makes some progress (#2044) */
    static MIN_PRODUCTIVITY = 5;

    constructor(gameState) {
        this.gameState = gameState;
        this.playerCompany = null;
        this.employees = [];
        this.clients = [];
        this.projects = [];
        this.meetings = [];
        this.skills = ['data_analysis', 'machine_learning', 'visualization', 'statistics', 'programming', 'communication', 'management'];
    }

    /**
     * The player's cash lives on gameState.money; economySystem.money never
     * existed, so every affordability check used to pass for free (#1739)
     */
    getMoney() {
        return Number(this.gameState?.money) || 0;
    }

    spend(amount) {
        this.gameState.money = this.getMoney() - amount;
    }

    /**
     * Start a new company
     */
    startCompany(name, type = 'consulting') {
        // One company at a time; a second one would orphan the first's staff (#1007)
        if (this.playerCompany) return null;
        this.playerCompany = {
            id: this._nextId('player_company'),
            name: name,
            type: type,
            founded: this.gameState.timeManager?.totalDays || 1,
            capital: this.getMoney(),
            reputation: 0,
            contacts: 0,
            skillPoints: 0,
            employees: [],
            clients: [],
            projects: []
        };

        return this.playerCompany;
    }

    /**
     * Buy an existing company
     */
    buyCompany(companyId, price) {
        price = Number(price);
        if (!Number.isFinite(price) || price < 0) {
            return { success: false, message: 'Invalid price' };
        }
        if (this.playerCompany) {
            return { success: false, message: 'You already own a company' };
        }
        if (this.getMoney() < price) {
            return { success: false, message: 'Not enough money' };
        }

        this.spend(price);
        this.playerCompany = {
            id: companyId,
            name: 'Acquired Company',
            type: 'acquired',
            acquired: true,
            capital: price,
            reputation: 50,
            contacts: 0,
            skillPoints: 0,
            employees: [],
            clients: [],
            projects: []
        };

        return { success: true, message: 'Company acquired' };
    }

    _nextId(prefix) {
        if (this._idSeq == null) this._idSeq = 0;
        this._idSeq += 1;
        return `${prefix}_${Date.now()}_${this._idSeq}`;
    }

    /**
     * Hire an employee. The first week's salary is paid up front (#218).
     */
    hireEmployee(candidate) {
        if (!this.playerCompany) {
            return { success: false, message: 'You need a company first' };
        }
        if (!candidate || !candidate.name) {
            return { success: false, message: 'Invalid candidate' };
        }
        if (this.employees.length >= CompanyManagementSystem.MAX_EMPLOYEES) {
            return { success: false, message: `Your company is full (${CompanyManagementSystem.MAX_EMPLOYEES} staff max)` };
        }

        const salary = this.calculateSalary(candidate);
        if (this.getMoney() < salary) {
            return { success: false, message: 'Cannot afford salary' };
        }

        this.spend(salary);
        const employee = {
            id: this._nextId('emp'),
            name: candidate.name,
            skills: candidate.skills || {},
            experience: Number(candidate.experience) || 0,
            salary: salary,
            hired: this.gameState.timeManager?.totalDays || 1,
            productivity: this.calculateProductivity(candidate),
            currentTask: null,
            satisfaction: 50
        };

        this.employees.push(employee);
        this.playerCompany.employees.push(employee.id);

        return { success: true, employee: employee };
    }

    /**
     * Calculate salary based on skills
     */
    calculateSalary(candidate) {
        let baseSalary = 500;
        let skillBonus = 0;

        this.skills.forEach(skill => {
            const level = Number(candidate?.skills?.[skill]) || 0;
            skillBonus += level * 100;
        });

        // Missing experience counts as 0 instead of producing NaN (#1011)
        const experience = Number(candidate?.experience) || 0;
        return baseSalary + skillBonus + (experience * 50);
    }

    /**
     * Calculate productivity based on skills
     */
    calculateProductivity(candidate) {
        let productivity = 0;
        this.skills.forEach(skill => {
            const level = Number(candidate?.skills?.[skill]) || 0;
            productivity += level;
        });
        // Skills learned at events (conferences, workshops) boost productivity
        const skillBonus = (this.playerCompany?.skillPoints || 0) * 0.5;
        const value = productivity / this.skills.length + skillBonus;
        return Math.min(100, Math.max(CompanyManagementSystem.MIN_PRODUCTIVITY, value));
    }

    /**
     * Satisfaction scales output: 50 is neutral, 0 halves it, 100 is +50% (#2043)
     */
    getEffectiveProductivity(employee) {
        const satisfaction = Number.isFinite(employee?.satisfaction) ? employee.satisfaction : 50;
        return (employee?.productivity || 0) * (0.5 + satisfaction / 100);
    }

    /**
     * Assign task to employee. Refuses to silently replace a task that is
     * still in progress unless options.force is set (#1400).
     */
    assignTask(employeeId, task, options = {}) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) return { success: false, message: 'Employee not found' };

        if (employee.currentTask && !options.force) {
            const status = this.getEmployeeWorkStatus(employeeId);
            if (status && status.progress < 100) {
                return { success: false, message: `${employee.name} is still working on ${employee.currentTask.name}` };
            }
        }

        employee.currentTask = {
            id: task.id,
            name: task.name,
            type: task.type,
            difficulty: task.difficulty,
            deadline: task.deadline,
            clientId: task.clientId || null,
            progress: 0,
            assigned: this.gameState.timeManager?.totalDays || 1
        };

        // Client work is tracked as a company project (#1401)
        if (task.clientId) {
            const project = {
                id: this._nextId('project'),
                taskId: task.id,
                name: task.name,
                clientId: task.clientId,
                employeeId,
                status: 'in_progress',
                started: employee.currentTask.assigned
            };
            this.projects.push(project);
            this.playerCompany?.projects.push(project.id);
            const client = this.clients.find(c => c.id === task.clientId);
            client?.projects.push(project.id);
        }

        return { success: true, message: 'Task assigned' };
    }

    /**
     * Visualize employee working
     */
    getEmployeeWorkStatus(employeeId) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) return null;

        if (!employee.currentTask) {
            return { status: 'idle', message: `${employee.name} is waiting for a task` };
        }

        const task = employee.currentTask;
        const daysWorking = (this.gameState.timeManager?.totalDays || 1) - task.assigned;
        const difficulty = Number(task.difficulty) > 0 ? Number(task.difficulty) : 1;
        const progress = Math.min(100, (daysWorking / difficulty) * this.getEffectiveProductivity(employee));

        return {
            status: 'working',
            employee: employee.name,
            task: task.name,
            progress: progress,
            message: `${employee.name} is working on ${task.name} (${Math.round(progress)}% complete)`
        };
    }

    /**
     * Find new clients. Each lead has a stable id (#1009, #1398).
     */
    findClients() {
        // Bigger clients only talk to companies with a reputation (#1740)
        const reputation = Number(this.playerCompany?.reputation ?? this.gameState?.reputation) || 0;
        const potentialClients = [
            { name: 'TechCorp', needs: 'data_analysis', budget: 5000, minReputation: 0 },
            { name: 'RetailCo', needs: 'visualization', budget: 3000, minReputation: 0 },
            { name: 'FinanceInc', needs: 'machine_learning', budget: 8000, minReputation: 25 },
            { name: 'StartupXYZ', needs: 'statistics', budget: 2000, minReputation: 0 }
        ].filter(c => reputation >= c.minReputation).map(({ minReputation, ...c }) => c);

        // Contacts made at events expand the pool of potential clients
        const contacts = this.playerCompany?.contacts || 0;
        const extraClients = [
            { name: 'MediaGroup', needs: 'communication', budget: 4000 },
            { name: 'LogisticsCo', needs: 'management', budget: 6000 },
            { name: 'HealthTech', needs: 'programming', budget: 7000 },
            { name: 'EduPlatform', needs: 'data_analysis', budget: 5500 },
            { name: 'GreenEnergy', needs: 'statistics', budget: 6500 }
        ];

        for (let i = 0; i < contacts && i < extraClients.length; i++) {
            potentialClients.push(extraClients[i]);
        }

        return potentialClients.map(c => ({ id: `client_${c.name.toLowerCase()}`, ...c }));
    }

    /**
     * Acquire client (by lead id, or by name for older callers)
     */
    acquireClient(clientId) {
        if (!this.playerCompany) {
            return { success: false, message: 'You need a company first' };
        }
        const client = this.findClients().find(c => c.id === clientId || c.name === clientId);
        if (!client) return { success: false, message: 'Client not found' };
        if (this.clients.some(c => c.id === client.id)) {
            return { success: false, message: `${client.name} is already your client` };
        }

        const record = {
            id: client.id,
            name: client.name,
            needs: client.needs,
            budget: client.budget,
            satisfaction: 50,
            projects: []
        };
        this.clients.push(record);
        this.playerCompany.clients.push(record.id);

        return { success: true, client: record };
    }

    /**
     * Schedule meeting (stored so it can be shown and saved) (#1403)
     */
    scheduleMeeting(clientId, location, time) {
        const meeting = {
            id: this._nextId('meeting'),
            clientId: clientId,
            location: location,
            time: time,
            type: 'client_meeting',
            status: 'scheduled'
        };
        this.meetings.push(meeting);
        return meeting;
    }

    /**
     * Weekly company tick: pay staff, collect client retainers, and let
     * neglected clients drift away (#1741, #2043)
     */
    processWeek() {
        const result = { payroll: 0, revenue: 0, lostClients: [] };
        if (!this.playerCompany) return result;

        for (const employee of this.employees) {
            result.payroll += employee.salary || 0;
            // Idle staff get bored; busy staff stay engaged
            const delta = employee.currentTask ? 2 : -5;
            employee.satisfaction = Math.max(0, Math.min(100, (employee.satisfaction ?? 50) + delta));
        }

        for (const client of [...this.clients]) {
            const active = this.projects.some(p => p.clientId === client.id && p.status === 'in_progress');
            client.satisfaction = Math.max(0, Math.min(100, (client.satisfaction ?? 50) + (active ? 5 : -10)));
            if (client.satisfaction <= 0) {
                this.clients = this.clients.filter(c => c.id !== client.id);
                this.playerCompany.clients = this.playerCompany.clients.filter(id => id !== client.id);
                result.lostClients.push(client.name);
                continue;
            }
            // Weekly retainer: a quarter of the monthly budget, scaled by satisfaction
            result.revenue += Math.round((client.budget || 0) / 4 * (client.satisfaction / 100));
        }

        this.gameState.money = this.getMoney() - result.payroll + result.revenue;
        return result;
    }

    /**
     * Attend event in town
     */
    attendEvent(eventId) {
        const events = [
            { id: 'networking', name: 'Networking Event', benefit: 'contacts' },
            { id: 'conference', name: 'Data Science Conference', benefit: 'skills' },
            { id: 'workshop', name: 'Workshop', benefit: 'skills' },
            { id: 'meetup', name: 'Local Meetup', benefit: 'contacts' }
        ];

        const event = events.find(e => e.id === eventId);
        if (!event) return null;

        return {
            event: event,
            result: this.processEvent(event)
        };
    }

    processEvent(event) {
        switch (event.benefit) {
            case 'contacts':
                if (this.playerCompany) this.playerCompany.contacts += 3;
                return { contacts: 3, message: 'You made new contacts' };
            case 'skills':
                if (this.playerCompany) this.playerCompany.skillPoints += 5;
                return { skills: 5, message: 'You learned new skills' };
            default:
                return { message: 'You attended ' + event.name };
        }
    }

    /**
     * Serialize player-visible state for saving
     */
    toJSON() {
        return pickState(this, ['playerCompany', 'employees', 'clients', 'projects', 'meetings']);
    }

    /**
     * Restore state from a save (missing fields keep constructor defaults)
     */
    fromJSON(data) {
        if (!data) return;
        applyState(this, data, ['playerCompany', 'employees', 'clients', 'projects', 'meetings']);
    }
}
