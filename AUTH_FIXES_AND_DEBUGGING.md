# Authentication Issues - Fixes Applied and Debugging Guide

## 🔴 Issues Identified

### 1. **Login Redirect Loop**
**Problem**: After successful login, users see "Login successful!" message but get redirected back to login page instead of dashboard.

**Root Cause**: The `useAuth` hook had `refetchOnWindowFocus: false` and `retry: false`, so after login, the `auth.me` query wasn't automatically refetching to check the new session cookie.

**Fix Applied**: Updated `useAuth` hook to use `retry: 1` and `refetchOnWindowFocus: "stale"` to properly refresh authentication state after login.

---

### 2. **Cookie Not Being Recognized Across Requests**
**Problem**: Even though the cookie is set on login, it's not being sent/recognized on subsequent requests.

**Root Cause**: Cookie domain logic was incorrect for Manus deployments. The code was setting domain as `.your-app.manus.computer` but Manus subdomains don't work with leading dots.

**Fix Applied**: Updated `getSessionCookieOptions()` in `server/_core/cookies.ts` to detect Manus domains and set them without the leading dot while keeping the behavior for other domains.

```typescript
// Before: domain = `.your-app.manus.computer` ❌
// After: domain = `your-app.manus.computer` ✅
```

---

### 3. **Silent Email Sending Failures**
**Problem**: Registration completes but users report not receiving confirmation emails.

**Root Cause**: Email sending errors were caught but not properly logged. Missing environment variables (Forge API URL/Key) wouldn't prevent registration.

**Fix Applied**: 
- Changed from try-catch to checking return value
- Added console.warn when email fails
- Better error logging in authentication flow

---

## 🛠️ Fixes Applied

### File: `server/_core/cookies.ts`
```typescript
// NEW LOGIC: Detect Manus domains and handle correctly
if (shouldSetDomain && !hostname.startsWith(".")) {
  if (hostname.includes("manus.computer") || hostname.includes("manus.space")) {
    domain = hostname;  // ✅ No leading dot for Manus
  } else {
    domain = `.${hostname}`;  // ✅ Leading dot for other multi-subdomain setups
  }
}
```

### File: `client/src/_core/hooks/useAuth.ts`
```typescript
// BEFORE
const meQuery = trpc.auth.me.useQuery(undefined, {
  retry: false,
  refetchOnWindowFocus: false,
});

// AFTER ✅
const meQuery = trpc.auth.me.useQuery(undefined, {
  retry: 1,
  refetchOnWindowFocus: "stale",
});
```

### File: `client/src/pages/Login.tsx`
```typescript
// BEFORE
onSuccess: async () => {
  toast.success("Login successful!");
  await utils.auth.me.invalidate();
  setLocation("/dashboard");
}

// AFTER ✅
onSuccess: async () => {
  await utils.auth.me.refetch();  // Refetch immediately
  toast.success("Login successful!");
  setLocation("/dashboard");
}
```

### File: `server/routers.ts`
```typescript
// Better error logging for email
const emailSent = await sendEmail({...});
if (!emailSent) {
  console.warn("[Auth] Welcome email failed to send but registration completed");
}

// Enhanced login logging
console.log("[Auth] User logged in:", input.email);
console.log("[Auth] Cookie name:", COOKIE_NAME);
console.log("[Auth] Cookie options:", JSON.stringify(cookieOptions));
console.log("[Auth] Session token set, length:", sessionToken.length);
```

---

## 🔍 Debugging Steps

### Step 1: Check Environment Variables
Make sure these are set in your Manus environment:
```bash
# Email configuration (required for email sending)
BUILT_IN_FORGE_API_URL=https://your-forge-api-url
BUILT_IN_FORGE_API_KEY=your-api-key

# Authentication (required)
JWT_SECRET=your-secret-key
OAUTH_SERVER_URL=your-oauth-url
VITE_APP_ID=your-app-id

# Database (required)
DATABASE_URL=your-database-url
```

### Step 2: Monitor Server Logs
When a user registers/logs in, check for these log messages:

**Successful Registration**:
```
[Email] Successfully sent email to user@example.com
[Auth] New user registered: user@example.com
```

**Successful Login**:
```
[Auth] User logged in: user@example.com
[Auth] Cookie name: app_session_id
[Auth] Cookie options: {"httpOnly":true,"path":"/","sameSite":"lax","secure":true,"domain":"your-app.manus.computer"}
[Auth] Session token set, length: [JWT length]
```

**If Email Fails**:
```
[Email] Forge API URL not configured  ← Missing env var
[Email] Forge API key not configured  ← Missing env var
[Email] Failed to send email to user@example.com (401 Unauthorized)
[Auth] Welcome email failed to send but registration completed
```

### Step 3: Browser Developer Tools - Network Tab
1. Go to Login page and submit login form
2. Look at the POST request to `/api/trpc`
3. In Response tab, you should see: `{"success":true,"user":{...}}`
4. In Cookies tab after response, verify:
   - Cookie name: `app_session_id` ✅
   - Domain: `your-app.manus.computer` ✅
   - Secure: ✅
   - HttpOnly: ✅
   - SameSite: `Lax` ✅

### Step 4: Browser Developer Tools - Console
After successful login, the browser should:
1. Call `auth.me` query with the session cookie
2. Get back the logged-in user data
3. Redirect to `/dashboard`

**Look for errors like**:
```
[Auth] No session cookie found
[Auth] Session verification failed
```

### Step 5: Database Check
```sql
-- Check if user was created
SELECT id, email, name, emailVerified FROM participants WHERE email = 'user@example.com';

-- Check last signed in timestamp
SELECT email, lastSignedIn FROM participants WHERE email = 'user@example.com';
```

---

## ✅ Testing the Complete Flow

### Test 1: Registration Flow
1. Go to `/register`
2. Fill in form and submit
3. Check server logs for email success/failure
4. Should see "Registration successful!" message
5. Auto-redirect to `/login` after 1.5 seconds
6. **Expected**: User created in database

### Test 2: Login Flow (After fix)
1. Go to `/login`
2. Enter credentials
3. Monitor browser Network tab - POST to `/api/trpc` should have:
   - Request: email + password
   - Response: `{"success":true,"user":{...}}`
   - Response Headers: `Set-Cookie: app_session_id=...`
4. Browser console should show auth refetch happening
5. Should redirect to `/dashboard`
6. **Expected**: Dashboard loads with user data

### Test 3: Session Persistence
1. After successful login on `/dashboard`
2. Refresh the page (F5)
3. **Expected**: User stays authenticated (session cookie is sent)

### Test 4: Cookie Settings
1. Open DevTools → Application → Cookies
2. Look for `app_session_id` cookie
3. Verify:
   - Domain: `.your-app.manus.computer` (or just `your-app.manus.computer` for Manus)
   - Path: `/`
   - Secure: ✅
   - HttpOnly: ✅
   - SameSite: `Lax`

---

## 🐛 If Issues Persist

### Issue: Email still not sending
1. Verify `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` are correct
2. Check Forge API service is running and accessible
3. Check network connectivity from server to Forge API
4. Look for 401/403/500 errors in server logs

### Issue: Login redirect still happening
1. Check `useAuth` hook was updated (should have `retry: 1`)
2. Check Network tab to see if `auth.me` query is being called
3. Look for JavaScript errors in console
4. Clear browser cache and cookies, try again

### Issue: Cookie not being set
1. Verify `getSessionCookieOptions()` is correctly identifying Manus domain
2. Check server logs for cookie options being logged
3. Verify `secure` is `true` (should be for Manus HTTPS)
4. Check if multiple cookies are being set/cleared

### Issue: User says "successfully logged in" but still on login page
1. **This means**: `auth.me` query returned user but redirect didn't happen
2. Check JavaScript console for errors
3. Verify `setLocation("/dashboard")` is being called
4. Check browser history - there might be a race condition

---

## 📋 Session Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Registration                      │
│─────────────────────────────────────────────────────────│
│ 1. Fill form + submit                                    │
│ 2. Hash password                                         │
│ 3. Create user in DB                                    │
│ 4. Send welcome email (logs failure if fails)          │
│ 5. Return: "Registration successful"                    │
│ 6. Redirect to /login after 1.5s                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      User Login                           │
│─────────────────────────────────────────────────────────│
│ 1. Submit email + password                              │
│ 2. Verify password hash                                │
│ 3. Create session token (JWT)                          │
│ 4. Set HTTP-only cookie with token ✅ FIXED            │
│    - Cookie: app_session_id=<jwt>                      │
│    - Domain: your-app.manus.computer ✅ FIXED          │
│    - HttpOnly: true                                    │
│    - Secure: true                                      │
│ 5. Return: {success: true, user}                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Frontend Auth Validation                     │
│─────────────────────────────────────────────────────────│
│ 1. Login mutation succeeds                              │
│ 2. Call auth.me query to fetch user ✅ FIXED           │
│    - Browser auto-includes session cookie              │
│    - Should retry once if fails                        │
│ 3. Query returns user data                             │
│ 4. Redirect to /dashboard                              │
│ 5. Dashboard loads with user context                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Session on Subsequent Requests              │
│─────────────────────────────────────────────────────────│
│ Every API request includes:                             │
│   Headers: Cookie: app_session_id=<jwt>               │
│                                                         │
│ Server validates:                                       │
│ 1. Extract cookie from headers                         │
│ 2. Verify JWT signature                                │
│ 3. Check not expired                                   │
│ 4. Return authenticated user context                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Next Steps

1. **Redeploy** with these fixes to your Manus environment
2. **Monitor logs** during user registration/login
3. **Test complete flow** as outlined above
4. **Verify email sending** if enabled (check server logs)
5. **Check browser cookies** match expected format for Manus

---

## 📝 Notes

- All fixes are backward compatible
- Cookies will use `SameSite: Lax` for better compatibility
- Email failures don't block registration (by design)
- Session tokens valid for 1 year (365 days)
- All authentication endpoints are case-insensitive for email
