```javascript
const CompanyManagementSystem = require('../../js/game/company/CompanyManagementSystem');
const { EconomySystem } = require('../../js/game/economy/EconomySystem');

describe('CompanyManagementSystem', () => {
    let companyManagementSystem;
    let gameState;

    beforeEach(() => {
        gameState = {
            economySystem: new EconomySystem(),
            playerCompany: {
                employees: [],
                money: 1000
            }
        };
        companyManagementSystem = new CompanyManagementSystem(gameState);
    });

    describe('buyCompany', () => {
        it('should reject insufficient funds and leave money unchanged', () => {
            const companyId = 'company1';
            const price = 1500;
            gameState.economySystem.money = 500;

            const result = companyManagementSystem.buyCompany(companyId, price);

            expect(result).toEqual({ success: false, reason: 'Insufficient funds' });
            expect(gameState.economySystem.money).toBe(500);
        });

        it('should succeed and deduct exactly the price from money', () => {
            const companyId = 'company1';
            const price = 1500;
            gameState.economySystem.money = 2000;

            const result = companyManagementSystem.buyCompany(companyId, price);

            expect(result).toEqual({ success: true });
            expect(gameState.economySystem.money).toBe(500);
        });
    });

    describe('hireEmployee', () => {
        it('should reject if no playerCompany exists', () => {
            gameState.playerCompany = null;

            const candidate = { name: 'John Doe', salary: 500 };

            const result = companyManagementSystem.hireEmployee(candidate);

            expect(result).toEqual({ success: false, reason: 'No player company' });
        });

        it('should reject insufficient funds and leave employees unchanged', () => {
            const candidate = { name: 'John Doe', salary: 800 };
            gameState.playerCompany.money = 500;

            const result = companyManagementSystem.hireEmployee(candidate);

            expect(result).toEqual({ success: false, reason: 'Insufficient funds' });
            expect(gameState.playerCompany.employees.length).toBe(0);
        });

        it('should hire employee and deduct exactly the salary from money', () => {
            const candidate = { name: 'John Doe', salary: 500 };

            const result = companyManagementSystem.hireEmployee(candidate);

            expect(result).toEqual({ success: true });
            expect(gameState.playerCompany.employees.length).toBe(1);
            expect(gameState.playerCompany.employees[0]).toEqual(candidate);
            expect(gameState.economySystem.money).toBe(500); // Currently failing due to known bug
        });
    });
});