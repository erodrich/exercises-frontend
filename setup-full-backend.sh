#!/bin/bash

# Script to configure both Auth and Admin to use backend
echo "🔧 Configuring Frontend to use Full Backend Integration..."
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

# Create/update .env.development for full backend integration
echo "📝 Creating .env.development for full backend integration..."
cat > .env.development << 'EOF'
# Development Environment Configuration
# This file is used when running: npm run dev

# Use Mock Authentication (localStorage-based)
# Set to 'true' for local development without backend auth
# Set to 'false' to connect to real backend API for auth
VITE_USE_MOCK_AUTH=false

# Use Mock Admin Service (in-memory)
# Set to 'true' for local development with mock data (3 exercises)
# Set to 'false' to connect to real backend API for admin operations
VITE_USE_MOCK_ADMIN=false

# API Backend URL (includes context path /exercise-logging)
VITE_API_URL=http://localhost:8080/exercise-logging
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
echo "✅ Full Backend Integration Configured!"
echo ""
echo "Configuration:"
echo "  ✓ Auth: Backend API"
echo "  ✓ Admin: Backend API"
echo "  ✓ API URL: http://localhost:8080/exercise-logging"
echo ""
echo "This means:"
echo "  • Login will authenticate against backend database"
echo "  • Admin dashboard will fetch/modify exercises in backend database"
echo "  • Real JWT tokens will be used"
echo ""
echo "Admin Credentials (from backend data.sql):"
echo "  Email: admin@exercises.com"
echo "  Password: Admin123!"
echo ""
echo "Next steps:"
echo "1. Make sure backend is running:"
echo "   cd ../exercises-backend"
echo "   mvn spring-boot:run"
echo ""
echo "2. Restart frontend dev server:"
echo "   npm run dev"
echo ""
echo "3. Login with backend admin credentials:"
echo "   Email: admin@exercises.com"
echo "   Password: Admin123!"
echo ""
echo "4. Navigate to Admin Panel"
echo "5. Should see ALL exercises from database!"
echo ""
echo "To verify backend is running:"
echo "  curl -i http://localhost:8080/exercise-logging/api/v1/admin/exercises"
echo "  (Should return 403 Forbidden - needs auth)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
