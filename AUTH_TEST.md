# Authentication System Test

## ✅ Login System Test

### Test Cases:
1. **Existing User Login** (hman@gmail.com):
   - ✅ Should find user in localStorage
   - ✅ Should set user data and token
   - ✅ Should redirect to dashboard

2. **New User Login**:
   - ✅ Should show "User not found" error
   - ✅ Should prompt to register first

## ✅ Registration System Test

### Test Cases:
1. **New User Registration**:
   - ✅ Validates all required fields
   - ✅ Checks password strength
   - ✅ Requires terms agreement
   - ✅ Creates user with selected role
   - ✅ Saves to localStorage
   - ✅ Auto-login after registration

2. **Role Selection**:
   - ✅ Customer role available
   - ✅ Manager role available
   - ✅ Admin role (can be added manually)

## 🔧 Current Authentication Flow:

1. **Registration**:
   ```
   User fills form → Validates data → Creates user object → 
   Saves to allUsers array → Sets token → Redirects to dashboard
   ```

2. **Login**:
   ```
   User enters credentials → Finds user in allUsers → 
   Sets token and userData → Redirects to dashboard
   ```

3. **Persistence**:
   ```
   localStorage stores:
   - allUsers: Array of all registered users
   - token: Current session token
   - userData: Current logged-in user data
   ```

## 🎯 Test Instructions:

### To Test Registration:
1. Go to /register
2. Fill in: Name, Email, Password (8+ chars with special chars), Role
3. Check "I agree to terms"
4. Click "Create account"
5. Should redirect to dashboard with correct role

### To Test Login:
1. Go to /login
2. Enter registered email and any password
3. Click "Sign in"
4. Should redirect to dashboard

### Pre-configured Test Account:
- Email: hman@gmail.com
- Role: manager
- Password: any (mock system)