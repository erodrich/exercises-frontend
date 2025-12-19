#!/bin/bash

# Verification script for frontend setup
echo "🔍 Verifying Frontend Setup..."
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in exercises-frontend directory"
    echo "   Run: cd exercises-frontend"
    exit 1
fi

echo "✅ In frontend directory"
echo ""

# Check for .env files
echo "📄 Checking environment files:"
if [ -f ".env.development" ]; then
    echo "   ✅ .env.development exists"
    if grep -q "VITE_USE_MOCK_AUTH=true" .env.development 2>/dev/null; then
        echo "   ✅ Mock auth is enabled"
    else
        echo "   ⚠️  Mock auth not explicitly set to true"
        echo "   Add: VITE_USE_MOCK_AUTH=true"
    fi
else
    echo "   ❌ .env.development not found"
    echo "   Creating it now..."
    echo "VITE_USE_MOCK_AUTH=true" > .env.development
    echo "   ✅ Created .env.development with mock auth enabled"
fi

if [ -f ".env" ]; then
    echo "   ℹ️  .env exists (overrides .env.development)"
fi
echo ""

# Check if node_modules exists
echo "📦 Checking dependencies:"
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules exists"
else
    echo "   ❌ node_modules not found"
    echo "   Run: npm install"
    exit 1
fi
echo ""

# Check Vite cache
echo "🗂️  Checking Vite cache:"
if [ -d "node_modules/.vite" ]; then
    echo "   ⚠️  Vite cache exists (may contain old code)"
    echo "   Consider running: rm -rf node_modules/.vite"
else
    echo "   ✅ No Vite cache (clean state)"
fi
echo ""

# Check if dev server is running
echo "🌐 Checking if dev server is running:"
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "   ⚠️  Port 5173 is in use (dev server may be running)"
    echo "   Stop it before restarting"
else
    echo "   ✅ Port 5173 is free"
fi
echo ""

# Check critical files exist
echo "📝 Checking critical files:"
FILES=(
    "src/components/LoginForm.tsx"
    "src/hooks/useAuth.ts"
    "src/infrastructure/auth/MockAuthStorage.ts"
    "src/config/auth.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file NOT FOUND"
    fi
done
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Setup Summary:"
echo ""
echo "To start debugging:"
echo "1. Clear Vite cache (if exists): rm -rf node_modules/.vite"
echo "2. Start dev server: npm run dev"
echo "3. Open browser with DevTools (F12)"
echo "4. Clear localStorage: localStorage.clear()"
echo "5. Hard refresh: Ctrl+Shift+R"
echo "6. Test login with invalid credentials"
echo "7. Check console for detailed logs"
echo ""
echo "Expected console message:"
echo "🧪 Using Mock Authentication (localStorage)"
echo ""
echo "For detailed debugging guide, see:"
echo "ERROR_DISPLAY_DEBUGGING.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
