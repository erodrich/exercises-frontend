#!/bin/bash

# Script to configure admin service to use backend API
echo "🔧 Configuring Admin Service to use Backend API..."
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
echo "📝 Updating .env.development..."
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

# API Backend URL (used when VITE_USE_MOCK_AUTH=false or VITE_USE_MOCK_ADMIN=false)
VITE_API_URL=http://localhost:8080
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
echo "Admin Service Configuration:"
echo "  - Auth: Mock (localStorage) ✅"
echo "  - Admin: Backend API ✅"
echo "  - API URL: http://localhost:8080"
echo ""
echo "This means:"
echo "  ✓ You can login with mock users (admin@exercises.com)"
echo "  ✓ Admin dashboard will fetch exercises from backend"
echo "  ✓ Create/Update/Delete will hit the backend API"
echo ""
echo "Next steps:"
echo "1. Make sure backend is running on port 8080"
echo "2. Start frontend dev server: npm run dev"
echo "3. Login as admin: admin@exercises.com / Admin123!"
echo "4. Go to Admin Panel → Should see all exercises from DB"
echo ""
echo "To check backend is running:"
echo "  curl http://localhost:8080/api/v1/exercises"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
