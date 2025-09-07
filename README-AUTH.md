# ERP Authentication System

## Overview
A complete user authentication and management system built for your ERP application, implementing all endpoints from your OpenAPI specification.

## 🚀 Quick Start

1. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env and set your API URL
   VITE_BASE_URL=http://localhost:3000
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Visit: http://localhost:5173
   - Default route shows login page for unauthenticated users
   - After login, redirects to admin dashboard

## 📁 Project Structure

```
src/
├── contexts/
│   └── auth-context.tsx        # Authentication state management
├── service/
│   └── auth.service.ts         # API service for all auth endpoints
├── types/
│   └── auth.ts                 # TypeScript interfaces from OpenAPI spec
├── pages/
│   ├── auth/
│   │   └── sign-in.tsx         # Login form
│   ├── admin/
│   │   ├── admin-layout.tsx    # Admin dashboard layout
│   │   ├── dashboard.tsx       # Dashboard overview
│   │   └── users/
│   │       └── user-management.tsx  # User CRUD interface
│   └── protected-routes/
│       ├── layout-protect.tsx  # Auth guard for protected pages
│       └── login-protect.tsx   # Redirect logic for login page
├── api/
│   └── api-urls.ts             # Centralized API endpoints
└── hooks/
    └── useAuth.ts              # Auth hook (re-exports context)
```

## 🔐 Authentication Features

### User Authentication
- **Login**: Email/password authentication with JWT tokens
- **Logout**: Secure session termination
- **Token Refresh**: Automatic token renewal
- **Password Reset**: Email-based password reset flow
- **Account Activation**: Email verification for new accounts

### User Management (Admin)
- **Create Users**: Register new users with role assignment
- **View Users**: Paginated user list with filtering
- **Edit Users**: Update user profiles and permissions
- **Delete Users**: Remove users from system
- **Toggle Status**: Activate/deactivate user accounts
- **Resend Activation**: Re-send activation emails
- **Role Management**: User/Admin role assignment with permissions

## 🛡️ Security Features

### Token Management
- JWT tokens stored in localStorage
- Refresh tokens handled via httpOnly cookies
- Automatic token refresh on API calls
- Secure logout with token cleanup

### Route Protection
- `LayoutProtect`: Protects admin routes, redirects to login if unauthenticated
- `LoginProtect`: Redirects authenticated users away from login page
- Loading states during authentication checks

### Error Handling
- Comprehensive error messages
- Network error recovery
- API error parsing and display

## 📝 API Endpoints Implemented

All endpoints from your OpenAPI specification are implemented:

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout  
- `POST /api/users/refresh` - Refresh tokens
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password
- `POST /api/users/activate` - Activate account

### User Management
- `POST /api/users` - Create new user
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `PATCH /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `PATCH /api/users/{id}/change-password` - Change password
- `PATCH /api/users/{id}/toggle-status` - Toggle user status
- `PATCH /api/users/{id}/verify-email` - Verify email
- `POST /api/users/{id}/resend-activation` - Resend activation

## 🎨 UI Components

### Login Page
- Clean, modern design with Ant Design
- Form validation
- Loading states
- Error handling

### Admin Dashboard
- Responsive sidebar navigation
- User profile dropdown
- System statistics overview
- Recent activity feed

### User Management
- Data table with sorting and filtering
- Modal forms for create/edit operations
- Inline actions (edit, delete, activate)
- Role and permission management
- Status indicators for account state

## 🔧 Configuration

### Environment Variables
```env
VITE_BASE_URL=http://localhost:3000  # Your backend API URL
NODE_ENV=development
```

### TypeScript Configuration
- Path aliases configured for clean imports
- Strict type checking enabled
- All API responses properly typed

### Build Configuration
- Vite for fast development and building
- Path alias resolution for clean imports
- Production-ready bundling

## 🚦 Usage Examples

### Login Flow
```typescript
const { login, isLoading } = useAuth();

const handleLogin = async (credentials: LoginDto) => {
  try {
    await login(credentials);
    // Automatically redirected to admin dashboard
  } catch (error) {
    // Error automatically displayed via message
  }
};
```

### User Management
```typescript
const { user, updateUser } = useAuth();

const handleUpdateUser = async (userId: number, data: UpdateUserDto) => {
  try {
    await updateUser(userId, data);
    // Success message automatically shown
  } catch (error) {
    // Error automatically handled
  }
};
```

### Protected Routes
```typescript
// Automatically handles authentication state
<LayoutProtect>
  <AdminLayout />
</LayoutProtect>
```

## 🧪 Testing

To test the authentication system:

1. **Start the development server**: `npm run dev`
2. **Visit**: http://localhost:5173
3. **Test login** with your backend credentials
4. **Navigate** to user management at `/admin/users`
5. **Test user CRUD operations**

## 🔄 Integration with Backend

Ensure your backend:
1. **Accepts** the API endpoints as specified
2. **Returns** responses matching the TypeScript interfaces
3. **Sets** httpOnly cookies for refresh tokens
4. **Handles** CORS for your frontend domain
5. **Sends** activation emails for new users

## 📱 Responsive Design

The application is fully responsive:
- **Mobile-first** design approach
- **Collapsible** sidebar on small screens
- **Touch-friendly** interactions
- **Accessible** form controls

## 🔍 Debugging

Common issues and solutions:

1. **CORS errors**: Configure your backend to allow requests from `http://localhost:5173`
2. **401 errors**: Check if your backend returns proper JWT tokens
3. **Missing user data**: Verify your backend returns user info after login
4. **Email not sending**: Check your backend email service configuration

The authentication system is production-ready and follows security best practices!