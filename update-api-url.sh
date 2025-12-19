#!/bin/bash

# Script to update API URL with correct context path
echo "🔧 Updating API URL with context path..."
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in exercises-frontend directory"
    exit 1
fi

# Backup existing .env.development if it exists
if [ -f ".env.development" ]; then
    echo "📦 Backing up existing .env.development"
    cp .env.development .env.development.backup
fi

# Create/update .env.development with correct API URL
echo "📝 Updating .env.development with correct API URL..."
cat > .env.development << 'EOF'
# Development Environment Configuration
# This file is used when running: npm run dev

# Use Mock Authentication (localStorage-based)
# Set to 'true' for local development without backend auth
# Set to 'false' to connect to real backend API for auth
VITE_USE_MOCK_AUTH=true

# Use Mock Admin Service (in-memory)
# Set to 'true' for local development with mock data (3 exercises)
# Set to 'false' to connect to real backend API for admin operations
VITE_USE_MOCK_ADMIN=false

# API Backend URL (includes context path /exercise-logging)
VITE_API_URL=http://localhost:8080/exercise-logging
EOF

echo "✅ Updated .env.development"
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
echo "✅ Configuration Complete!"
echo ""
echo "API Configuration:"
echo "  - Base URL: http://localhost:8080/exercise-logging"
echo "  - Admin Endpoint: /api/v1/admin/exercises"
echo "  - Full URL: http://localhost:8080/exercise-logging/api/v1/admin/exercises"
echo ""
echo "Next steps:"
echo "1. Restart frontend dev server: npm run dev"
echo "2. Login as admin: admin@exercises.com / Admin123!"
echo "3. Navigate to Admin Panel"
echo "4. Should see all exercises from database"
echo ""
echo "⚠️  Note: You'll need to login with backend credentials"
echo "   Mock auth won't work for API calls - switch to:"
echo "   VITE_USE_MOCK_AUTH=false to use backend auth"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
