// ...
const NPCManager = {
    // ...
    getNPC(id) {
        // ...
        switch (id) {
            // ...
            case 'david_chen':
                return {
                    id: 'david_chen',
                    name: 'David Chen',
                    personality: 'ambitious',
                    backstory: 'Made millions in tech. Now invests in promising data-driven startups.',
                    benefits: { seedFunding: true, vcIntros: true },
                    gifts: ['business_books', 'gold_bars'],
                    romanceOptions: true,
                    relationships: 0,
                    flags: {}
                };
            // ...
        }
        // ...
    },
    // ...
    getNPCState(id) {
        // ...
        const state = this.npcStates[id] || {};
        if (state.relationships >= 50 && !state.flags.secretRevealed) {
            state.flags.secretRevealed = true;
            state.backstory = 'Was once a wealthy tech investor, but lost everything in a bad investment. Now struggles to keep up appearances.';
            state.benefits = { seedFunding: false, vcIntros: true };
        }
        return state;
    },
    // ...
};
// ...