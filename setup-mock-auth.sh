#!/bin/bash

# Script to set up mock authentication for local testing
echo "🔧 Setting up Mock Authentication..."
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in exercises-frontend directory"
    exit 1
fi

# Backup existing .env.development if it exists
if [ -f ".env.development" ]; then
    echo "📦 Backing up existing .env.development to .env.development.backup"
    cp .env.development .env.development.backup
fi

# Create/update .env.development
echo "📝 Creating .env.development with mock auth enabled..."
cat > .env.development << 'EOF'
# Development Environment Configuration
# This file is used when running: npm run dev

# Use Mock Authentication (localStorage-based)
# Set to 'true' for local development without backend
# Set to 'false' to connect to real backend API
VITE_USE_MOCK_AUTH=true

# API Backend URL (used when VITE_USE_MOCK_AUTH=false)
VITE_API_URL=http://localhost:8080/api/v1
EOF

echo "✅ Created .env.development"
echo ""

# Show the file content
echo "📄 Content of .env.development:"
cat .env.development
echo ""

# Clean Vite cache
if [ -d "node_modules/.vite" ]; then
    echo "🗑️  Clearing Vite cache..."
    rm -rf node_modules/.vite
    echo "✅ Vite cache cleared"
else
    echo "ℹ️  No Vite cache to clear"
fi
echo ""

# Final instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Open browser at http://localhost:5173"
echo "3. Open DevTools (F12) → Console tab"
echo "4. Should see: 🧪 Using Mock Authentication (localStorage)"
echo ""
echo "Test Credentials:"
echo "━━━━━━━━━━━━━━━"
echo "Admin:"
echo "  Email: admin@exercises.com"
echo "  Password: Admin123!"
echo ""
echo "Or register a new user through the UI"
echo ""
echo "Debugging:"
echo "  All console logs are enabled in LoginForm and useAuth"
echo "  See ERROR_DISPLAY_DEBUGGING.md for detailed guide"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
