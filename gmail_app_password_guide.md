# Gmail App Password Setup for AlphaForge Email Alerts

## Issue Identified
Your SMTP system is configured correctly, but Gmail requires an "App Password" instead of your regular password for security.

## Quick Fix (2 minutes)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "2-Step Verification" 
3. Follow setup if not already enabled

### Step 2: Generate App Password
1. In Google Account Security, click "App passwords"
2. Select "Mail" from dropdown
3. Click "Generate"
4. Copy the 16-character password (like: abcd efgh ijkl mnop)

### Step 3: Update Your Replit Environment
Replace your current `SMTP_PASS` with the app password:
```
SMTP_PASS=abcd efgh ijkl mnop
```

## Alternative: Use Outlook/Hotmail Instead
If you prefer to avoid Gmail app passwords:

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com  
SMTP_PASS=your-regular-password
EMAIL_FROM=your-email@outlook.com
EMAIL_TO=executive-email@domain.com
```

Outlook allows regular passwords, making setup simpler.

## What Works Once Fixed
- Daily compliance reports (6 AM automated)
- Weekly executive reports (Monday 8 AM automated) 
- Real-time critical alerts for high-value prospects
- Professional HTML-formatted executive briefings

The system is ready - just needs the correct Gmail app password or switch to Outlook.