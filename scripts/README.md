# 🛠️ Build Scripts Documentation

This document explains the enhanced build scripts for the Spentiva Backend Server.

## Overview

The build system uses **chalk** for colorful, informative console output that makes development more pleasant and helps identify issues quickly.

## Scripts Location

All enhanced scripts are located in the `scripts/` directory:

```
scripts/
├── build.js   # Enhanced build script
├── dev.js     # Enhanced development server script
└── start.js   # Enhanced production server script
```

## Features

All enhanced scripts include:

- 🎨 **Colorful output** using chalk
- ⏱️ **Timing information** for each step
- ✅ **Success/Error indicators** with clear symbols
- 📊 **Progress tracking** for multi-step operations
- 🔍 **Build verification** before starting production
- 🚨 **Error handling** with helpful messages

---

## Build Script (`npm run build`)

### What It Does

1. **Cleans** the `dist/` directory
2. **Compiles** TypeScript using `tsc`
3. **Copies** email templates to `dist/templates/`

### Usage

```bash
npm run build
```

### Output Example

```
════════════════════════════════════════════════════════════
  🚀 Building Expense Tracker Server 🚀
════════════════════════════════════════════════════════════

Build started at: 4:44:15 pm

[1/3] 🧹 Cleaning output directory...
✓ Removed old dist folder

[2/3] 🔨 Compiling TypeScript...
[TypeScript Compilation] Starting...
✓ TypeScript Compilation completed (5.23s)

[3/3] 📋 Copying template files...
[Template Copy] Starting...
✓ Template Copy completed (0.45s)

════════════════════════════════════════════════════════════
  ✓ Build Completed Successfully! ✓
════════════════════════════════════════════════════════════

  All steps completed successfully!

  Total build time: 6.82s
  Output directory: ./dist
  Completed at: 4:44:22 pm

  🚀 Ready to start the server with: npm start
```

### Error Handling

If TypeScript compilation fails, you'll see:

```
✗ TypeScript Compilation failed (2.34s)
Error details: [compilation errors]

❌ Build failed during TypeScript compilation
```

---

## Development Script (`npm run dev`)

### What It Does

1. **Displays** development mode information
2. **Starts** nodemon with TypeScript support
3. **Watches** for file changes and auto-restarts

### Usage

```bash
npm run dev
```

### Output Example

```
════════════════════════════════════════════════════════════
  🚀 Starting Development Server 🚀
════════════════════════════════════════════════════════════

ℹ Mode: Development
👀 Watching: All TypeScript files
🖥️ Auto-restart: Enabled

────────────────────────────────────────────────────────────

[nodemon output continues here...]
```

### Stopping the Server

Press `Ctrl+C` to stop the development server. You'll see:

```
👋 Development server stopped
```

---

## Start Script (`npm run start`)

### What It Does

1. **Verifies** that the `dist/` folder exists
2. **Checks** for the main entry point (`dist/index.js`)
3. **Starts** the production server

### Usage

```bash
npm run start
```

### Output Example

```
════════════════════════════════════════════════════════════
  🚀 Starting Production Server 🚀
════════════════════════════════════════════════════════════

✓ Build found
🖥️ Mode: Production

────────────────────────────────────────────────────────────

[server output continues here...]
```

### Missing Build Error

If you try to start without building first:

```
✗ Build not found!

  Please run the build first:
  npm run build
```

---

## Simple Scripts (Legacy)

These scripts run without the enhanced console output:

| Script                 | Command                         |
| ---------------------- | ------------------------------- |
| `npm run dev:simple`   | `nodemon src/index.ts`          |
| `npm run build:simple` | `tsc && npm run copy-templates` |
| `npm run start:simple` | `node dist/index.js`            |

Use these if you:

- Need plain output for CI/CD logs
- Are debugging script issues
- Prefer simpler, faster output

---

## Customizing the Scripts

### Changing Colors

Edit the script files in `scripts/` and modify the chalk colors:

```javascript
// Available chalk colors
chalk.red(); // Red text
chalk.green(); // Green text
chalk.blue(); // Blue text
chalk.yellow(); // Yellow text
chalk.cyan(); // Cyan text
chalk.magenta(); // Magenta text
chalk.white(); // White text
chalk.gray(); // Gray text

// Modifiers
chalk.bold(); // Bold text
chalk.dim(); // Dim text
```

### Adding More Build Steps

To add a new build step, edit `scripts/build.js`:

```javascript
// Step 4: Your new step
printStep('4/4', `${symbols.yourIcon} Your step description...`);
const success = executeCommand('your-command', 'Step Name');

if (!success) {
  console.log(chalk.red.bold('\n❌ Build failed during your step\n'));
  process.exit(1);
}
```

---

## Troubleshooting

### Script Not Found Error

```
Error: Cannot find module 'chalk'
```

**Solution:** Install chalk:

```bash
npm install chalk
```

### Permission Denied

On Unix systems, you may need to make scripts executable:

```bash
chmod +x scripts/*.js
```

### Windows Path Issues

The scripts use cross-platform paths and should work on Windows without modifications.

---

## Benefits of Enhanced Scripts

✅ **Better Developer Experience** - Clear, colorful output is easier to read  
✅ **Faster Debugging** - Timing info helps identify slow steps  
✅ **Error Prevention** - Build verification prevents starting without compiling  
✅ **Professional Look** - Makes your terminal output look modern and polished  
✅ **Team Friendly** - Easier for new developers to understand what's happening

---

## Technical Details

### Dependencies

- **chalk ^5.6.2** - Terminal string styling
- **child_process** - Running shell commands
- **fs** - File system operations
- **perf_hooks** - Performance timing

### Performance

The enhanced scripts add minimal overhead:

- ~50ms startup time
- ~10ms per step for console formatting
- Total impact: <100ms for typical builds

### Compatibility

- ✅ Node.js 20.x (ESM modules)
- ✅ Windows, macOS, Linux
- ✅ PowerShell, CMD, Bash, Zsh
- ✅ CI/CD environments (use `:simple` variants)

---

**Made with ❤️ by Exyconn**
