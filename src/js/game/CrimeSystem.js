export class CrimeSystem {
    constructor() {
        this.heat = 0;
        this.crimesCommitted = 0;
        this.jailTimeServed = 0;
        this.isUnderInvestigation = false;
    }

    toJSON() {
        return {
            heat: this.heat,
            crimesCommitted: this.crimesCommitted,
            jailTimeServed: this.jailTimeServed,
            isUnderInvestigation: this.isUnderInvestigation
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.heat = data.heat || 0;
        this.crimesCommitted = data.crimesCommitted || 0;
        this.jailTimeServed = data.jailTimeServed || 0;
        this.isUnderInvestigation = data.isUnderInvestigation || false;
    }
}