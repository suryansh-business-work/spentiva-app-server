#!/usr/bin/env node

import chalk from 'chalk';
import { spawn } from 'child_process';

// Console symbols
const symbols = {
  rocket: '🚀',
  server: '🖥️',
  watch: '👀',
  info: chalk.blue('ℹ'),
};

// Print header
function printHeader() {
  console.clear();
  console.log(chalk.bold.cyan('═'.repeat(60)));
  console.log(chalk.bold.cyan(`  ${symbols.rocket} Starting Development Server ${symbols.rocket}`));
  console.log(chalk.bold.cyan('═'.repeat(60)) + '\n');
}

// Main dev function
function startDev() {
  printHeader();

  console.log(`${symbols.info} ${chalk.blue('Mode:')} ${chalk.white.bold('Development')}`);
  console.log(
    `${symbols.watch} ${chalk.blue('Watching:')} ${chalk.white.bold('All TypeScript files')}`
  );
  console.log(`${symbols.server} ${chalk.blue('Auto-restart:')} ${chalk.white.bold('Enabled')}\n`);

  console.log(chalk.gray('─'.repeat(60)) + '\n');

  // Start nodemon
  const nodemon = spawn('nodemon', ['src/index.ts'], {
    stdio: 'inherit',
    shell: true,
  });

  nodemon.on('error', error => {
    console.error(chalk.red.bold('\n❌ Error starting development server:\n'));
    console.error(error);
    process.exit(1);
  });

  nodemon.on('exit', code => {
    if (code !== 0) {
      console.log(chalk.red.bold(`\n❌ Development server exited with code ${code}\n`));
      process.exit(code);
    }
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log(chalk.yellow.bold('\n\n👋 Development server stopped\n'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow.bold('\n\n👋 Development server stopped\n'));
  process.exit(0);
});

// Start dev server
startDev();
