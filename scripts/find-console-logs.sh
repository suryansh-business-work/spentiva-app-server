#!/bin/bash

# Script to remove console.log statements and replace with logger
# Run this from project root

echo "🔍 Finding all console.log statements..."

# Files to update (excluding scripts, node_modules, dist)
FILES=$(find src -type f \( -name "*.ts" -o -name "*.js" \) ! -path "*/node_modules/*" ! -path "*/dist/*" ! -name "index.ts")

echo "📝 Files to process:"
echo "$FILES"

echo ""
echo "⚠️  Manual Review Required:"
echo "The following files contain console statements that need manual review:"
echo ""

# List all files with console statements
grep -r "console\." src --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=dist -l

echo ""
echo "💡 Recommendation:"
echo "1. Review each file manually"
echo "2. Replace console.log → logger.info"
echo "3. Replace console.error → logger.error"  
echo "4. Replace console.warn → logger.warn"
echo "5. Keep console.log only in:"
echo "   - index.ts (server startup messages)"
echo "   - dev scripts"
echo ""
