#!/usr/bin/env node
/**
 * Generates a file inventory and line count report for a given directory.
 * Usage: node generate-file-inventory.js <directory>
 */

const fs = require('fs');
const path = require('path');
const program = require('commander');

program
  .arguments('<directory>')
  .option('-e, --extensions <extensions>', 'Comma-separated list of file extensions to include', 'js,ts')
  .option('-l, --lines', 'Include line count for each file', false)
  .parse(process.argv);

const { args, lines, extensions } = program;
const directory = args[0];
const extensionList = extensions.split(',');

/**
 * Counts the number of lines in a file.
 * @param {string} filePath - The path to the file.
 * @returns {number} The number of lines in the file.
 */
function countLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  // Subtract 1 if the file ends with a newline
  return lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;
}

/**
 * Checks if a file has one of the specified extensions.
 * @param {string} filePath - The path to the file.
 * @returns {boolean} True if the file has a specified extension, false otherwise.
 */
function hasValidExtension(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return extensionList.includes(ext);
}

/**
 * Generates the file inventory and line count report.
 * @param {string} dir - The directory to scan.
 * @param {boolean} includeLines - Whether to include line count for each file.
 */
function generateReport(dir, includeLines) {
  let totalFiles = 0;
  let totalLines = 0;

  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        generateReport(filePath, includeLines);
      } else if (stats.isFile() && hasValidExtension(filePath)) {
        totalFiles++;
        if (includeLines) {
          const lineCount = countLines(filePath);
          totalLines += lineCount;
          console.log(`${filePath}: ${lineCount} lines`);
        }
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}: ${error.message}`);
  }

  if (!includeLines) {
    console.log(`Total Files: ${totalFiles}`);
  } else {
    console.log(`Total Lines: ${totalLines}`);
  }
}

generateReport(directory, lines);