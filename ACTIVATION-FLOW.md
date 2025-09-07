# Account Activation & Password Reset Flow

## 🎯 Complete Email Activation System

I've created a complete email activation and password reset system for your ERP application!

## 📧 **How It Works:**

### 1. **User Creation Process**
1. Admin creates a new user in the system (`/admin/users`)
2. Backend sends activation email to user with activation link
3. User clicks the activation link in their email
4. User sets their password and activates their account
5. User is automatically logged in and redirected to dashboard

### 2. **Password Reset Process**
1. User clicks "Forgot your password?" on login page
2. User enters their email address
3. Backend sends password reset email with reset link
4. User clicks the reset link in their email
5. User sets a new password
6. User is redirected to login page

## 🔗 **URL Examples:**

### Activation Links (from email):
```
http://localhost:5173/activate?token=a1b2c3d4-e5f6-7890-abcd-ef1234567890
http://localhost:5173/activate?activation_link=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Password Reset Links (from email):
```
http://localhost:5173/reset-password?token=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Forgot Password Page:
```
http://localhost:5173/forgot-password
```

## 🎨 **Pages Created:**

### 1. **Activate Account Page** (`/activate`)
- ✅ Validates activation token from URL
- ✅ Password strength requirements (8+ chars, uppercase, lowercase, number, special char)
- ✅ Password confirmation validation
- ✅ Success/error states with clear messaging
- ✅ Auto-login after successful activation
- ✅ Redirect to admin dashboard

### 2. **Reset Password Page** (`/reset-password`)
- ✅ Validates reset token from URL
- ✅ Same password requirements as activation
- ✅ Password confirmation validation
- ✅ Success/error states
- ✅ Redirect to login page after success

### 3. **Forgot Password Page** (`/forgot-password`)
- ✅ Email input with validation
- ✅ Send reset link functionality
- ✅ Success message (doesn't reveal if email exists - security)
- ✅ "Try another email" option

### 4. **Enhanced Login Page**
- ✅ Added "Forgot your password?" link
- ✅ Improved layout and styling

## 🔐 **Security Features:**

### Password Requirements:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter  
- ✅ At least one number
- ✅ At least one special character (@$!%*?&)
- ✅ Real-time validation with helpful error messages

### Token Validation:
- ✅ Validates activation/reset tokens from URL parameters
- ✅ Graceful handling of invalid/expired tokens
- ✅ Clear error messages for users
- ✅ Secure redirect flows

## 🧪 **Testing the Flow:**

### Test Account Activation:
1. **Create a user** in the admin panel
2. **Copy the activation link** from the API response (in network tab)
3. **Open the link** in a new tab: `http://localhost:5173/activate?token=YOUR_TOKEN_HERE`
4. **Set password** and activate account

### Test Password Reset:
1. **Go to login page**: http://localhost:5173
2. **Click "Forgot your password?"**
3. **Enter an email** and click "Send Reset Link"
4. **Get reset token** from your backend/database
5. **Open reset link**: `http://localhost:5173/reset-password?token=YOUR_TOKEN_HERE`
6. **Set new password**

### Test Forgot Password:
1. **Visit**: http://localhost:5173/forgot-password
2. **Enter email** and submit
3. **See success message** (always shows success for security)

## 📝 **Email Template Examples:**

### Activation Email Template:
```html
Subject: Activate Your ERP Account

Hello {{firstName}},

Your ERP account has been created! Please click the link below to activate your account and set your password:

{{activationLink}}

This link will expire in 24 hours.

Best regards,
ERP Team
```

### Password Reset Email Template:
```html
Subject: Reset Your ERP Password

Hello {{firstName}},

You requested a password reset for your ERP account. Please click the link below to reset your password:

{{resetLink}}

This link will expire in 1 hour. If you didn't request this, please ignore this email.

Best regards,
ERP Team
```

## 🎯 **API Integration:**

All pages are fully integrated with your existing API endpoints:
- ✅ `POST /api/users/activate` - Account activation
- ✅ `POST /api/users/reset-password` - Password reset
- ✅ `POST /api/users/forgot-password` - Request password reset

The system is ready to use! Users can now:
1. ✅ Receive activation emails when admins create their accounts
2. ✅ Set secure passwords with validation
3. ✅ Reset forgotten passwords via email
4. ✅ Get clear feedback on all operations

Perfect for your ERP system's user onboarding and password management!