# Admin Dashboard Feature

## Overview

The application now includes a full-featured admin dashboard for managing master data. Only users with the ADMIN role can access these features.

## Features

### 🔐 Role-Based Access Control
- Users are assigned roles: `USER` or `ADMIN`
- Admin button only visible to admin users
- Backend enforces role-based access via JWT

### 📊 Admin Dashboard
Navigate through different admin sections via tabs:
- **Exercises** - Manage exercise master data
- *(Future)* Users, Settings, Analytics

### 💪 Exercise Management

Full CRUD operations for exercises:

#### Create Exercise
1. Click "Add Exercise" button
2. Enter exercise name
3. Select muscle group (CHEST, BACK, SHOULDERS, LEGS, BICEPS, TRICEPS)
4. Click "Create"

#### Edit Exercise
1. Click edit icon (pencil) on any exercise
2. Modify name or muscle group
3. Click "Update"

#### Delete Exercise
1. Click delete icon (trash) on any exercise
2. Confirm deletion
3. Exercise removed immediately

#### View All Exercises
- Table view with sorting
- Search/filter *(coming soon)*
- Pagination *(coming soon)*

## Access

### Admin Credentials
**Development/Testing:**
- Email: `admin@exercises.com`
- Password: `Admin123!`

**Production:**
⚠️ **Change this password immediately after first login!**

### Navigating to Admin Dashboard
1. Login as admin user
2. See "Admin Dashboard" button on home screen
3. Click to access admin features

## Architecture

### Components

**`AdminDashboard.tsx`**
- Main container for admin features
- Tab navigation
- Header with user info and logout

**`ExerciseManagement.tsx`**
- Exercise CRUD table
- Modal forms for create/edit
- Real-time updates

### Services

**`adminService.ts`**
Provides two implementations:

1. **MockAdminService** *(Development)*
   - Uses in-memory storage
   - Great for frontend testing
   - No backend required

2. **HttpAdminService** *(Production)*
   - Calls backend API
   - Full authorization via JWT
   - Error handling for 403/404

### Hooks

**`useAdminService()`**
Returns the configured admin service instance. Currently uses Mock service for local development.

## API Integration

### Endpoints
All require `Authorization: Bearer <JWT>` with ADMIN role:

```typescript
GET    /api/v1/admin/exercises        // Get all exercises
GET    /api/v1/admin/exercises/:id    // Get by ID
POST   /api/v1/admin/exercises        // Create
PUT    /api/v1/admin/exercises/:id    // Update
DELETE /api/v1/admin/exercises/:id    // Delete
```

### Request/Response Format

**Exercise Model:**
```typescript
interface Exercise {
  name: string;
  group: string;  // CHEST | BACK | SHOULDERS | LEGS | BICEPS | TRICEPS
}

interface ExerciseWithId extends Exercise {
  id: string;
}
```

**Create/Update Request:**
```json
{
  "name": "Bench Press",
  "group": "CHEST"
}
```

**Response:**
```json
{
  "id": "1",
  "name": "Bench Press",
  "group": "CHEST"
}
```

### Error Handling
- **403 Forbidden** - User is not admin
- **404 Not Found** - Exercise doesn't exist
- **400 Bad Request** - Validation error

## Switching to Backend API

To use the real backend instead of mock service:

**`useAdminService.ts`:**
```typescript
import { HttpAdminService } from '../services/adminService';
import { authService } from '../config/auth';

export function useAdminService(): AdminService {
  // Get backend URL from environment
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  // Create HTTP service with token provider
  return new HttpAdminService(
    baseUrl,
    () => authService.getToken()
  );
}
```

## User Experience

### For Regular Users
- No admin button visible
- Cannot access `/admin` route
- Full access to their own features

### For Admins
- Admin button on home screen
- Access to admin dashboard
- Can still use regular user features
- See admin-specific navigation

## Testing

### Manual Testing
1. Login as `admin@exercises.com` / `Admin123!`
2. Click "Admin Dashboard"
3. Create a test exercise
4. Edit the exercise
5. Delete the exercise
6. Verify changes persist

### Automated Testing
```bash
# Run all tests
npm test

# Admin service tests
npm test adminService

# Component tests
npm test ExerciseManagement
npm test AdminDashboard
```

## Security

### Frontend Checks
- Role-based UI rendering
- Conditional route access
- Admin service checks for token

### Backend Enforcement
- JWT validation
- Role verification
- Endpoint protection via Spring Security

⚠️ **Note**: Frontend checks are for UX only. Backend always enforces security.

## Future Enhancements

### Planned Features
- [ ] User management (create/edit/delete users)
- [ ] Assign roles to users
- [ ] Bulk exercise import/export
- [ ] Exercise categories and tags
- [ ] Search and filter exercises
- [ ] Pagination for large datasets
- [ ] Audit log for admin actions
- [ ] Settings management

### Additional Tabs
Architecture supports adding more admin sections:
- Users Tab
- Settings Tab
- Analytics Tab
- Reports Tab

## Troubleshooting

### Admin Button Not Showing
**Problem**: Logged in as admin but button doesn't appear

**Solutions**:
1. Check user role in localStorage: `localStorage.getItem('mock_current_user')`
2. Verify role is `"ADMIN"` not `"USER"`
3. Re-login to refresh authentication
4. Clear localStorage and login again

### Cannot Create/Edit Exercise
**Problem**: Operations fail with errors

**Solutions**:
1. Check browser console for errors
2. Verify JWT token is valid
3. Ensure backend is running (if using HTTP service)
4. Check network tab for API call details

### Permission Denied
**Problem**: 403 Forbidden error

**Solutions**:
1. Token may be expired - re-login
2. User may not have ADMIN role
3. Backend security config may be incorrect
4. Check JWT contains role claim

### Changes Not Persisting
**Problem**: Using MockAdminService (in-memory)

**Solutions**:
1. Switch to HttpAdminService for persistence
2. Changes in mock are lost on page refresh
3. Use backend for production

## Code Examples

### Adding a New Admin Feature

**1. Create Service Method:**
```typescript
// adminService.ts
async getStatistics(): Promise<Result<Statistics>> {
  return this.fetchWithAuth<Statistics>('/api/v1/admin/statistics');
}
```

**2. Create Component:**
```typescript
// StatisticsView.tsx
export default function StatisticsView() {
  const adminService = useAdminService();
  const [stats, setStats] = useState<Statistics | null>(null);
  
  useEffect(() => {
    loadStatistics();
  }, []);
  
  const loadStatistics = async () => {
    const result = await adminService.getStatistics();
    if (result.success) {
      setStats(result.data);
    }
  };
  
  return <div>{/* Render statistics */}</div>;
}
```

**3. Add to Dashboard:**
```typescript
// AdminDashboard.tsx
type AdminTab = 'exercises' | 'statistics';

// Add tab button
<button onClick={() => setActiveTab('statistics')}>
  Statistics
</button>

// Add content
{activeTab === 'statistics' && <StatisticsView />}
```

## Summary

The admin dashboard provides:
- ✅ Complete exercise management (CRUD)
- ✅ Role-based access control
- ✅ Clean, intuitive UI
- ✅ Modal forms for create/edit
- ✅ Real-time updates
- ✅ Error handling
- ✅ Both mock and API implementations
- ✅ Easy to extend with new features

Perfect for managing master data while maintaining clean architecture and security!
