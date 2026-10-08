import { describe, it, expect } from 'vitest';
import { BankSystem, CREDIT_SCORE_MAX } from '../../src/js/game/BankSystem.js';

const make = (gs = {}) => {
    const state = { money: 1000, reputation: 0, ...gs };
    return { state, bank: new BankSystem(state) };
};
const total = (s) => s.money + s.bank.savings;

describe('BankSystem deposit/withdraw money integrity (#167)', () => {
    it('deposit moves money into savings without creating or destroying any', () => {
        const { state, bank } = make();
        const before = total(state);
        const r = bank.deposit(400);
        expect(r).toMatchObject({ success: true, newBalance: 400 });
        expect(state.money).toBe(600);
        expect(total(state)).toBe(before);
    });

    it('withdraw moves money back', () => {
        const { state, bank } = make();
        bank.deposit(400);
        const r = bank.withdraw(150);
        expect(r).toMatchObject({ success: true, newBalance: 250 });
        expect(state.money).toBe(750);
        expect(total(state)).toBe(1000);
    });

    it('exact-balance transfers are allowed', () => {
        const { state, bank } = make();
        expect(bank.deposit(1000).success).toBe(true);
        expect(state.money).toBe(0);
        expect(bank.withdraw(1000).success).toBe(true);
        expect(state.bank.savings).toBe(0);
    });

    it('rejects overdrafts and leaves balances untouched', () => {
        const { state, bank } = make();
        expect(bank.deposit(1001)).toMatchObject({ success: false, message: 'Insufficient funds' });
        expect(bank.withdraw(1)).toMatchObject({ success: false, message: 'Insufficient savings' });
        expect(state.money).toBe(1000);
        expect(state.bank.savings).toBe(0);
    });

    it('rejects zero, negative, NaN, Infinity and non-number amounts', () => {
        const { state, bank } = make();
        for (const bad of [0, -5, NaN, Infinity, '50', undefined, null]) {
            expect(bank.deposit(bad).success).toBe(false);
            expect(bank.withdraw(bad).success).toBe(false);
        }
        expect(state.money).toBe(1000);
        expect(state.bank.savings).toBe(0);
        expect(state.bank.transactionHistory).toHaveLength(0);
    });

    it('a long deposit/withdraw sequence conserves the total', () => {
        const { state, bank } = make({ money: 5000 });
        const ops = [[1, 300], [1, 1200], [0, 700], [1, 50], [0, 850], [0, 5000], [1, 9999]];
        for (const [dep, amt] of ops) (dep ? bank.deposit(amt) : bank.withdraw(amt));
        expect(total(state)).toBe(5000);
        expect(state.money).toBeGreaterThanOrEqual(0);
        expect(state.bank.savings).toBeGreaterThanOrEqual(0);
    });
});

describe('BankSystem loan lifecycle (#238)', () => {
    it('calculateMaxLoan at defaults is 1000', () => {
        expect(make().bank.calculateMaxLoan()).toBe(Math.floor((1000 + 0 * 100) * (500 / 500)));
    });

    it('calculateMaxLoan scales with reputation and credit score', () => {
        const { state, bank } = make({ reputation: 10 });
        state.bank.creditScore = 750;
        expect(bank.calculateMaxLoan()).toBe(Math.floor((1000 + 10 * 100) * (750 / 500)));
        expect(bank.calculateMaxLoan()).toBe(3000);
    });

    it('takeLoan adds to debt and cash, and refuses past the limit', () => {
        const { state, bank } = make();
        expect(bank.takeLoan(600).success).toBe(true);
        expect(state.money).toBe(1600);
        expect(state.bank.loan).toBe(600);
        expect(bank.takeLoan(401).success).toBe(false);
        expect(bank.takeLoan(400).success).toBe(true);
        expect(state.bank.loan).toBe(1000);
        expect(bank.takeLoan(-1).success).toBe(false);
    });

    it('repayLoan clamps overpayment to what is owed', () => {
        const { state, bank } = make();
        bank.takeLoan(300);
        const r = bank.repayLoan(5000 - 3700); // 1300 > 300 owed
        expect(r.success).toBe(true);
        expect(state.bank.loan).toBe(0);
        expect(state.money).toBe(1000);
        expect(r.message).toContain('paid off');
    });

    it('partial repayment builds a little credit, payoff builds more, capped at max', () => {
        const { state, bank } = make();
        bank.takeLoan(500);
        expect(bank.repayLoan(100).creditScore).toBe(505);
        expect(bank.repayLoan(400).creditScore).toBe(530);
        state.bank.creditScore = CREDIT_SCORE_MAX - 1;
        bank.takeLoan(10);
        bank.repayLoan(10);
        expect(state.bank.creditScore).toBe(CREDIT_SCORE_MAX);
    });

    it('repayLoan refuses with no loan or not enough cash', () => {
        const { state, bank } = make({ money: 0 });
        expect(bank.repayLoan(10)).toMatchObject({ success: false, message: 'No active loan' });
        state.bank.loan = 100;
        expect(bank.repayLoan(50)).toMatchObject({ success: false, message: 'Insufficient funds' });
        expect(state.bank.loan).toBe(100);
    });
});

describe('BankSystem.processWeeklyInterest (#239)', () => {
    // Both sides use Math.round since #1692 (the issue text predates that change)
    it('zero balances accrue nothing', () => {
        const { state, bank } = make();
        const r = bank.processWeeklyInterest();
        expect(r.savingsInterest).toBe(0);
        expect(r.loanInterest).toBe(0);
        expect(state.bank.savings).toBe(0);
        expect(state.bank.loan).toBe(0);
    });

    it('small balances round the same way for savings and loans', () => {
        const { state, bank } = make();
        state.bank.savings = 133; // 0.665 -> 1
        state.bank.loan = 4;      // 0.4 -> 0
        state.bank.repaidThisWeek = true;
        const r = bank.processWeeklyInterest();
        expect(r.savingsInterest).toBe(1);
        expect(state.bank.savings).toBe(134);
        expect(r.loanInterest).toBe(0);
        expect(state.bank.loan).toBe(4);
    });

    it('typical balances', () => {
        const { state, bank } = make();
        state.bank.savings = 10000; // 0.5% -> 50
        state.bank.loan = 1000;     // 10% -> 100
        const r = bank.processWeeklyInterest();
        expect(r.savingsInterest).toBe(50);
        expect(r.loanInterest).toBe(100);
        expect(state.bank.savings).toBe(10050);
        expect(state.bank.loan).toBe(1100);
        expect(r.overLimit).toBe(true);
    });

    it('does nothing without a bank', () => {
        const { state, bank } = make();
        delete state.bank;
        expect(bank.processWeeklyInterest()).toEqual({ savingsInterest: 0, loanInterest: 0 });
    });
});
