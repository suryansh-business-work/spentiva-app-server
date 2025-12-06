#!/usr/bin/env node

import { execSync } from 'child_process';
import chalk from 'chalk';
import { existsSync, rmSync } from 'fs';
import { performance } from 'perf_hooks';

// Console symbols
const symbols = {
  success: chalk.green('✓'),
  error: chalk.red('✗'),
  info: chalk.blue('ℹ'),
  warning: chalk.yellow('⚠'),
  rocket: chalk.cyan('🚀'),
  box: chalk.magenta('📦'),
  clean: chalk.yellow('🧹'),
  build: chalk.blue('🔨'),
  copy: chalk.cyan('📋'),
};

// Helper function to print section headers
function printHeader(message) {
  console.log('\n' + chalk.bold.cyan('═'.repeat(60)));
  console.log(chalk.bold.cyan(`  ${message}`));
  console.log(chalk.bold.cyan('═'.repeat(60)) + '\n');
}

// Helper function to print step info
function printStep(step, message) {
  console.log(chalk.bold(`[${step}] `) + chalk.white(message));
}

// Helper function to execute commands with error handling
function executeCommand(command, stepName) {
  const startTime = performance.now();

  try {
    printStep(stepName, `Starting...`);
    execSync(command, { stdio: 'inherit' });
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(
      `${symbols.success} ${chalk.green.bold(stepName + ' completed')} ${chalk.gray(`(${duration}s)`)}\n`
    );
    return true;
  } catch (error) {
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(
      `${symbols.error} ${chalk.red.bold(stepName + ' failed')} ${chalk.gray(`(${duration}s)`)}\n`
    );
    console.error(chalk.red('Error details:'), error.message);
    return false;
  }
}

// Main build function
async function build() {
  const buildStartTime = performance.now();

  // Print build header
  console.clear();
  printHeader(`${symbols.rocket} Building Expense Tracker Server ${symbols.rocket}`);

  console.log(chalk.gray(`Build started at: ${new Date().toLocaleTimeString()}\n`));

  // Step 1: Clean dist folder
  printStep('1/3', `${symbols.clean} Cleaning output directory...`);
  const distPath = 'dist';

  if (existsSync(distPath)) {
    try {
      rmSync(distPath, { recursive: true, force: true });
      console.log(`${symbols.success} ${chalk.green('Removed old dist folder')}\n`);
    } catch (error) {
      console.log(`${symbols.warning} ${chalk.yellow('Could not remove old dist folder')}\n`);
    }
  } else {
    console.log(`${symbols.info} ${chalk.blue('No existing dist folder to clean')}\n`);
  }

  // Step 2: Compile TypeScript
  printStep('2/3', `${symbols.build} Compiling TypeScript...`);
  const tscSuccess = executeCommand('tsc', 'TypeScript Compilation');

  if (!tscSuccess) {
    console.log(chalk.red.bold('\n❌ Build failed during TypeScript compilation\n'));
    process.exit(1);
  }

  // Step 3: Copy templates
  printStep('3/3', `${symbols.copy} Copying template files...`);
  const copySuccess = executeCommand('copyfiles -u 1 src/templates/**/* dist/', 'Template Copy');

  if (!copySuccess) {
    console.log(
      chalk.yellow.bold('\n⚠ Warning: Template files may not have been copied correctly\n')
    );
  }

  // Build summary
  const totalDuration = ((performance.now() - buildStartTime) / 1000).toFixed(2);

  printHeader(`${symbols.success} Build Completed Successfully! ${symbols.success}`);

  console.log(chalk.green.bold('  All steps completed successfully!\n'));
  console.log(chalk.gray(`  Total build time: ${chalk.white.bold(totalDuration + 's')}`));
  console.log(chalk.gray(`  Output directory: ${chalk.white.bold('./dist')}`));
  console.log(chalk.gray(`  Completed at: ${chalk.white.bold(new Date().toLocaleTimeString())}\n`));

  console.log(
    chalk.cyan.bold(`  ${symbols.rocket} Ready to start the server with: `) +
      chalk.white.bold('npm start\n')
  );
}

// Run build
build().catch(error => {
  console.error(chalk.red.bold('\n❌ Unexpected error during build:\n'));
  console.error(error);
  process.exit(1);
});
