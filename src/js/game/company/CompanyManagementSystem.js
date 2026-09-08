/**
 * CompanyManagementSystem.js
 * Manages company creation, hiring, skills, tasks, and workers
 */

export class CompanyManagementSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.playerCompany = null;
        this.employees = [];
        this.clients = [];
        this.projects = [];
        this.skills = ['data_analysis', 'machine_learning', 'visualization', 'statistics', 'programming', 'communication', 'management'];
    }
    
    /**
     * Start a new company
     */
    startCompany(name, type = 'consulting') {
        this.playerCompany = {
            id: 'player_company_' + Date.now(),
            name: name,
            type: type,
            founded: this.gameState.timeManager?.totalDays || 1,
            capital: this.gameState.economySystem?.money || 0,
            reputation: 0,
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
        if (this.gameState.economySystem.money < price) {
            return { success: false, message: 'Not enough money' };
        }
        
        this.gameState.economySystem.money -= price;
        this.playerCompany = {
            id: companyId,
            name: 'Acquired Company',
            type: 'acquired',
            acquired: true,
            capital: price,
            reputation: 50,
            employees: [],
            clients: [],
            projects: []
        };
        
        return { success: true, message: 'Company acquired' };
    }
    
    /**
     * Hire an employee
     */
    hireEmployee(candidate) {
        if (!this.playerCompany) {
            return { success: false, message: 'You need a company first' };
        }
        
        const salary = this.calculateSalary(candidate);
        if (this.gameState.economySystem.money < salary) {
            return { success: false, message: 'Cannot afford salary' };
        }
        
        this.gameState.economySystem.money -= salary;
        
        const employee = {
            id: 'emp_' + Date.now(),
            name: candidate.name,
            skills: candidate.skills || {},
            experience: candidate.experience || 0,
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
            const level = candidate.skills?.[skill] || 0;
            skillBonus += level * 100;
        });
        
        return baseSalary + skillBonus + (candidate.experience * 50);
    }
    
    /**
     * Calculate productivity based on skills
     */
    calculateProductivity(candidate) {
        let productivity = 0;
        this.skills.forEach(skill => {
            const level = candidate.skills?.[skill] || 0;
            productivity += level;
        });
        return Math.min(100, productivity / this.skills.length);
    }
    
    /**
     * Assign task to employee
     */
    assignTask(employeeId, task) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) return { success: false, message: 'Employee not found' };
        
        employee.currentTask = {
            id: task.id,
            name: task.name,
            type: task.type,
            difficulty: task.difficulty,
            deadline: task.deadline,
            progress: 0,
            assigned: this.gameState.timeManager?.totalDays || 1
        };
        
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
        const progress = Math.min(100, (daysWorking / task.difficulty) * employee.productivity);
        
        return {
            status: 'working',
            employee: employee.name,
            task: task.name,
            progress: progress,
            message: `${employee.name} is working on ${task.name} (${Math.round(progress)}% complete)`
        };
    }
    
    /**
     * Find new clients
     */
    findClients() {
        const potentialClients = [
            { name: 'TechCorp', needs: 'data_analysis', budget: 5000 },
            { name: 'RetailCo', needs: 'visualization', budget: 3000 },
            { name: 'FinanceInc', needs: 'machine_learning', budget: 8000 },
            { name: 'StartupXYZ', needs: 'statistics', budget: 2000 }
        ];
        
        return potentialClients;
    }
    
    /**
     * Acquire client
     */
    acquireClient(clientId) {
        const client = this.findClients().find(c => c.name === clientId);
        if (!client) return { success: false };
        
        this.clients.push({
            id: 'client_' + Date.now(),
            name: client.name,
            needs: client.needs,
            budget: client.budget,
            satisfaction: 50,
            projects: []
        });
        
        return { success: true, client: client };
    }
    
    /**
     * Schedule meeting
     */
    scheduleMeeting(clientId, location, time) {
        return {
            id: 'meeting_' + Date.now(),
            clientId: clientId,
            location: location,
            time: time,
            type: 'client_meeting',
            status: 'scheduled'
        };
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
                return { contacts: 3, message: 'You made new contacts' };
            case 'skills':
                return { skills: 5, message: 'You learned new skills' };
            default:
                return { message: 'You attended ' + event.name };
        }
    }
}

