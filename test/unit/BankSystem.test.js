/**
 * Unit tests for BankSystem - specifically logTransaction
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BankSystem } from '../../src/js/game/BankSystem.js';

describe('BankSystem', () => {
    let gameState;
    let bankSystem;

    beforeEach(() => {
        gameState = {
            money: 1000,
            reputation: 5,
            bank: {
                savings: 100,
                loan: 0,
                loanInterestRate: 0.10,
                savingsInterestRate: 0.005,
                creditScore: 500,
                transactionHistory: []
            }
        };
        bankSystem = new BankSystem(gameState);
    });

    describe('logTransaction', () => {
        it('should initialize transactionHistory if missing', () => {
            // Arrange
            const stateWithoutHistory = {
                money: 1000,
                bank: {
                    savings: 100
                }
            };
            const bank = new BankSystem(stateWithoutHistory);
            
            // Assert before call
            expect(stateWithoutHistory.bank.transactionHistory).toBeUndefined();
            
            // Act
            bank.logTransaction('Deposit', 50);
            
            // Assert
            expect(stateWithoutHistory.bank.transactionHistory).toBeDefined();
            expect(Array.isArray(stateWithoutHistory.bank.transactionHistory)).toBe(true);
        });

        it('should return early if gameState.bank is falsy', () => {
            // Arrange - create a state with bank, then remove it
            const stateWithBank = {
                money: 1000,
                bank: {
                    savings: 100
                }
            };
            const bank = new BankSystem(stateWithBank);
            stateWithBank.bank = null; // Simulate bank becoming null
            
            // Act
            const result = bank.logTransaction('Deposit', 50);
            
            // Assert
            expect(result).toBeUndefined();
            expect(stateWithBank.bank).toBeNull();
        });

        it('should add transaction with correct type and amount shape', () => {
            // Act
            bankSystem.logTransaction('Deposit', 50);
            
            // Assert
            expect(gameState.bank.transactionHistory.length).toBe(1);
            const transaction = gameState.bank.transactionHistory[0];
            expect(transaction.type).toBe('Deposit');
            expect(transaction.amount).toBe(50);
            expect(transaction.date).toBeDefined();
            expect(transaction.balance).toBe(gameState.bank.savings);
        });

        it('should store negative amounts for withdrawals and repayments', () => {
            // Act
            bankSystem.logTransaction('Withdrawal', -30);
            
            // Assert
            const transaction = gameState.bank.transactionHistory[0];
            expect(transaction.amount).toBe(-30);
            expect(transaction.type).toBe('Withdrawal');
        });

        it('should add transactions in newest-first order (unshift)', () => {
            // Act
            bankSystem.logTransaction('Deposit', 10);
            bankSystem.logTransaction('Deposit', 20);
            bankSystem.logTransaction('Deposit', 30);
            
            // Assert
            expect(gameState.bank.transactionHistory.length).toBe(3);
            expect(gameState.bank.transactionHistory[0].amount).toBe(30); // newest first
            expect(gameState.bank.transactionHistory[1].amount).toBe(20);
            expect(gameState.bank.transactionHistory[2].amount).toBe(10);
        });

        it('should cap history at 20 transactions and drop oldest', () => {
            // Act - push 25 transactions
            for (let i = 1; i <= 25; i++) {
                bankSystem.logTransaction('Deposit', i);
            }
            
            // Assert
            expect(gameState.bank.transactionHistory.length).toBe(20);
            
            // The 20 remaining should be the newest 20 (25, 24, 23, ... 6)
            // Most recent (25) should be at index 0
            expect(gameState.bank.transactionHistory[0].amount).toBe(25);
            // Oldest kept (6) should be at index 19
            expect(gameState.bank.transactionHistory[19].amount).toBe(6);
            
            // The 5 oldest (1, 2, 3, 4, 5) should be dropped
            const allAmounts = gameState.bank.transactionHistory.map(t => t.amount);
            expect(allAmounts).not.toContain(1);
            expect(allAmounts).not.toContain(2);
            expect(allAmounts).not.toContain(3);
            expect(allAmounts).not.toContain(4);
            expect(allAmounts).not.toContain(5);
        });

        it('should record different transaction types from callers', () => {
            // Act - simulate all caller types
            bankSystem.logTransaction('Deposit', 100);
            bankSystem.logTransaction('Withdrawal', -50);
            bankSystem.logTransaction('Loan Taken', 200);
            bankSystem.logTransaction('Loan Repayment', -75);
            
            // Assert
            const types = gameState.bank.transactionHistory.map(t => t.type);
            expect(types).toContain('Deposit');
            expect(types).toContain('Withdrawal');
            expect(types).toContain('Loan Taken');
            expect(types).toContain('Loan Repayment');
        });

        it('should record balance at time of transaction', () => {
            // Arrange
            gameState.bank.savings = 1000;
            
            // Act
            bankSystem.logTransaction('Deposit', 100);
            
            // Assert
            const transaction = gameState.bank.transactionHistory[0];
            expect(transaction.balance).toBe(1000);
        });

        it('should include ISO date format in transaction', () => {
            // Act
            bankSystem.logTransaction('Deposit', 50);
            
            // Assert
            const transaction = gameState.bank.transactionHistory[0];
            expect(transaction.date).toBeDefined();
            expect(typeof transaction.date).toBe('string');
            // Should be a valid ISO string
            expect(() => new Date(transaction.date)).not.toThrow();
        });
    });

    describe('integration with deposit/withdraw/loan methods', () => {
        it('deposit should call logTransaction with correct type and amount', () => {
            // Act
            const result = bankSystem.deposit(50);
            
            // Assert
            expect(result.success).toBe(true);
            expect(gameState.bank.transactionHistory.length).toBe(1);
            const transaction = gameState.bank.transactionHistory[0];
            expect(transaction.type).toBe('Deposit');
            expect(transaction.amount).toBe(50);
        });

        it('withdraw should call logTransaction with negative amount', () => {
            // Act
            const result = bankSystem.withdraw(50);
            
            // Assert
            expect(result.success).toBe(true);
            expect(gameState.bank.transactionHistory.length).toBe(1);
            const transaction = gameState.bank.transactionHistory[0];
            expect(transaction.type).toBe('Withdrawal');
            expect(transaction.amount).toBe(-50);
        });

        it('takeLoan should call logTransaction with correct type and amount', () => {
            // Act
            const result = bankSystem.takeLoan(200);
            
            // Assert
            expect(result.success).toBe(true);
            expect(gameState.bank.transactionHistory.length).toBe(1);
            const transaction = gameState.bank.transactionHistory[0];
            expect(transaction.type).toBe('Loan Taken');
            expect(transaction.amount).toBe(200);
        });

        it('repayLoan should call logTransaction with negative amount', () => {
            // Arrange
            gameState.bank.loan = 300;
            
            // Act
            const result = bankSystem.repayLoan(100);
            
            // Assert
            expect(result.success).toBe(true);
            expect(gameState.bank.transactionHistory.length).toBe(1);
            const transaction = gameState.bank.transactionHistory[0];
            expect(transaction.type).toBe('Loan Repayment');
            expect(transaction.amount).toBe(-100);
        });
    });
});
