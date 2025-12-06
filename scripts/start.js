#!/usr/bin/env node

import chalk from 'chalk';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// Console symbols
const symbols = {
  rocket: '🚀',
  server: '🖥️',
  error: chalk.red('✗'),
  success: chalk.green('✓'),
  warning: chalk.yellow('⚠'),
};

// Print header
function printHeader() {
  console.clear();
  console.log(chalk.bold.green('═'.repeat(60)));
  console.log(chalk.bold.green(`  ${symbols.rocket} Starting Production Server ${symbols.rocket}`));
  console.log(chalk.bold.green('═'.repeat(60)) + '\n');
}

// Main start function
function startProduction() {
  printHeader();

  // Check if dist folder exists
  const distPath = join(process.cwd(), 'dist');
  const entryPoint = join(distPath, 'index.js');

  if (!existsSync(distPath)) {
    console.log(`${symbols.error} ${chalk.red.bold('Build not found!')}\n`);
    console.log(chalk.yellow('  Please run the build first:'));
    console.log(chalk.white.bold('  npm run build\n'));
    process.exit(1);
  }

  if (!existsSync(entryPoint)) {
    console.log(`${symbols.warning} ${chalk.yellow.bold('Entry point not found!')}\n`);
    console.log(chalk.yellow('  Expected file: ') + chalk.white.bold('dist/index.js'));
    console.log(chalk.yellow('  Please run the build first:'));
    console.log(chalk.white.bold('  npm run build\n'));
    process.exit(1);
  }

  console.log(`${symbols.success} ${chalk.green('Build found')}`);
  console.log(`${symbols.server} ${chalk.blue('Mode:')} ${chalk.white.bold('Production')}\n`);

  console.log(chalk.gray('─'.repeat(60)) + '\n');

  // Start the server
  const server = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    shell: true,
  });

  server.on('error', error => {
    console.error(chalk.red.bold('\n❌ Error starting production server:\n'));
    console.error(error);
    process.exit(1);
  });

  server.on('exit', code => {
    if (code !== 0) {
      console.log(chalk.red.bold(`\n❌ Server exited with code ${code}\n`));
      process.exit(code);
    }
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log(chalk.yellow.bold('\n\n👋 Server stopped\n'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow.bold('\n\n👋 Server stopped\n'));
  process.exit(0);
});

// Start production server
startProduction();
