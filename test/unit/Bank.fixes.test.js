import { describe, it, expect, beforeEach } from 'vitest';
import { BankSystem, DEFAULT_AFTER_WEEKS, CREDIT_SCORE_MAX } from '../../src/js/game/BankSystem.js';

describe('BankSystem fixes', () => {
    let gs, bank;
    beforeEach(() => { gs = { money: 0, reputation: 0 }; bank = new BankSystem(gs); });

    it('limit caps total debt across loans (#938, #1693)', () => {
        expect(bank.takeLoan(800).success).toBe(true);
        expect(bank.takeLoan(800).success).toBe(false);
        expect(bank.getAvailableCredit()).toBe(200);
    });

    it('repaying more than owed only needs the owed amount (#1382)', () => {
        bank.takeLoan(500);
        gs.money = 600;
        const r = bank.repayLoan(10000);
        expect(r.success).toBe(true);
        expect(gs.bank.loan).toBe(0);
        expect(gs.money).toBe(100);
    });

    it('missing creditScore does not produce NaN (#1379)', () => {
        delete gs.bank.creditScore;
        expect(bank.calculateMaxLoan()).toBe(1000);
        expect(bank.takeLoan(5000).success).toBe(false);
    });

    it('interest is logged (#1380) and rounds consistently (#1692)', () => {
        gs.bank.loan = 4; // 10% = 0.4 -> rounds to 0, no forced $1
        const r = bank.processWeeklyInterest();
        expect(r.loanInterest).toBe(0);
        gs.bank.loan = 1000;
        bank.processWeeklyInterest();
        expect(gs.bank.transactionHistory.some(t => t.type === 'Loan Interest')).toBe(true);
    });

    it('credit score grows with repayment and caps (#243, #1690)', () => {
        bank.takeLoan(100);
        gs.money = 1000;
        bank.repayLoan(100);
        expect(gs.bank.creditScore).toBe(525);
        gs.bank.creditScore = 849;
        bank.takeLoan(10); bank.repayLoan(10);
        expect(gs.bank.creditScore).toBe(CREDIT_SCORE_MAX);
    });

    it('defaults once after consecutive unpaid weeks; repaying resets (#247)', () => {
        bank.takeLoan(500);
        gs.reputation = 50;
        for (let i = 0; i < DEFAULT_AFTER_WEEKS - 1; i++) bank.processWeeklyInterest();
        expect(gs.bank.defaulted).toBeFalsy();
        const r = bank.processWeeklyInterest();
        expect(r.defaulted).toBe(true);
        const rep = gs.reputation;
        const r2 = bank.processWeeklyInterest();
        expect(r2.defaulted).toBeUndefined();
        expect(gs.reputation).toBe(rep);
        gs.money = 100000;
        bank.repayLoan(10);
        expect(gs.bank.missedWeeks).toBe(0);
    });
});
