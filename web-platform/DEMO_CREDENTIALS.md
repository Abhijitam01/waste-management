# Demo Login Credentials

## Test Account

**Email:** `demo@oceancleanup.com`  
**Password:** `Demo123!`

## How to Create This Account

1. Start the application:
   ```bash
   # Terminal 1: ML Service
   source venv/bin/activate && python app.py
   
   # Terminal 2: Frontend
   cd web-platform && npm run dev
   ```

2. Navigate to `http://localhost:3000/login`

3. Click "Don't have an account? Sign up"

4. Enter the credentials:
   - Email: `demo@oceancleanup.com`
   - Password: `Demo123!`
   - NGO Name: `Ocean Warriors Demo`

5. Click "Create Account"

## Alternative Demo Accounts

You can also create additional test accounts:

**Account 2:**
- Email: `test@ngo.org`
- Password: `Test123!`
- NGO: `Test NGO`

**Account 3:**
- Email: `cleanup@ocean.org`
- Password: `Cleanup123!`
- NGO: `Cleanup Crew`

## Notes

- These are demo accounts for testing purposes only
- All accounts use Firebase Authentication
- Passwords must be at least 6 characters
- Use strong passwords for production deployments

## Quick Login

Once created, you can login directly at:
`http://localhost:3000/login`

Enter the email and password, then click "Sign In"
