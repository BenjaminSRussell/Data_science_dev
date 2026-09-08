const WorkSystemValidator = require('../../src/js/dev/WorkSystemValidator');
const { JSDOM } = require('jsdom');

describe('WorkSystemValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new WorkSystemValidator();
  });

  describe('validateDataIntegrity', () => {
    it('should flag money NaN', () => {
      const results = validator.validateDataIntegrity({ money: NaN });
      expect(results.failed).toBe(1);
      expect(results.failedFields).toContain('money');
    });

    it('should flag money non-number', () => {
      const results = validator.validateDataIntegrity({ money: 'not a number' });
      expect(results.failed).toBe(1);
      expect(results.failedFields).toContain('money');
    });

    it('should flag reputation non-number', () => {
      const results = validator.validateDataIntegrity({ reputation: 'not a number' });
      expect(results.failed).toBe(1);
      expect(results.failedFields).toContain('reputation');
    });

    it('should flag rankIndex negative', () => {
      const results = validator.validateDataIntegrity({ rankIndex: -1 });
      expect(results.failed).toBe(1);
      expect(results.failedFields).toContain('rankIndex');
    });

    it('should increment passed/failed independently', () => {
      const results = validator.validateDataIntegrity({
        money: NaN,
        reputation: 500,
        rankIndex: 3
      });
      expect(results.passed).toBe(2);
      expect(results.failed).toBe(1);
      expect(results.failedFields).toContain('money');
    });
  });

  describe('validateTaskSystem', () => {
    it('should return error for missing task system', () => {
      const results = validator.validateTaskSystem();
      expect(results.error).toBe('Task system not found');
    });

    it('should flag missing task field', () => {
      const taskSystem = {
        tasks: [
          { id: 1 },
          { id: 2, requirements: [] }
        ]
      };
      const results = validator.validateTaskSystem(taskSystem);
      expect(results.error).toBe('Task missing required field: requirements');
    });
  });

  describe('validateWorkFlow', () => {
    it('should return error for missing task requirements', () => {
      const results = validator.validateWorkFlow({ requirements: 'not an array' });
      expect(results.error).toBe('Task requirements missing or invalid');
    });

    it('should fail early if no taskSystem', () => {
      const results = validator.validateWorkFlow();
      expect(results.error).toBe('Task system not found');
    });
  });

  describe('validateSorting', () => {
    let dom;

    beforeEach(() => {
      dom = new JSDOM(`
        <table>
          <thead>
            <tr>
              <th>Column 1</th>
              <th>Column 2</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Row 1, Col 1</td><td>Row 1, Col 2</td></tr>
            <tr><td>Row 2, Col 1</td><td>Row 2, Col 2</td></tr>
          </tbody>
        </table>
      `);
      global.document = dom.window.document;
    });

    it('should preserve row count after sorting', (done) => {
      const table = document.querySelector('table');
      validator.validateSorting(table).then(results => {
        expect(results.passed).toBe(true);
        expect(document.querySelectorAll('tbody tr').length).toBe(2);
        done();
      });
    });

    it('should handle reverse sorting', (done) => {
      const table = document.querySelector('table');
      validator.validateSorting(table).then(results => {
        expect(results.passed).toBe(true);
        validator.validateSorting(table).then(results => {
          expect(results.passed).toBe(true);
          expect(document.querySelectorAll('tbody tr').length).toBe(2);
          done();
        });
      });
    });
  });

  describe('validateFiltering', () => {
    it('should return failure when filter is absent', () => {
      dom = new JSDOM(`
        <table>
          <thead>
            <tr>
              <th>Column 1</th>
              <th>Column 2</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Row 1, Col 1</td><td>Row 1, Col 2</td></tr>
            <tr><td>Row 2, Col 1</td><td>Row 2, Col 2</td></tr>
          </tbody>
        </table>
      `);
      global.document = dom.window.document;

      const table = document.querySelector('table');
      const results = validator.validateFiltering(table);
      expect(results.passed).toBe(false);
    });
  });
});