# Arize AI Push Notification Setup for Security Canaries

## Current Status

**Local Mode:** Security events are currently logged locally and sent to `http://localhost:6006/v1/traces`
**Arize Cloud:** Ready to connect when API credentials are provided

## How to Enable Arize AI Push Notifications

### 1. Get Arize API Credentials
**Required Environment Variables:**
```bash
ARIZE_API_KEY=your_arize_api_key_here
ARIZE_SPACE_ID=your_space_id_here
ARIZE_ENDPOINT_URL=https://api.arize.com/v1/traces
```

### 2. Add Credentials to Environment
**In Replit:**
1. Go to Secrets tab in your Replit workspace
2. Add the three environment variables above
3. Restart the application

**Local Development:**
```bash
export ARIZE_API_KEY="your_api_key"
export ARIZE_SPACE_ID="your_space_id"
export ARIZE_ENDPOINT_URL="https://api.arize.com/v1/traces"
```

### 3. Verify Connection
Once credentials are added, the system will automatically:
- Detect Arize credentials on startup
- Switch from local to cloud mode
- Send all security events as traces to Arize AI
- Enable real-time push notifications

## What Gets Sent to Arize AI

### Security Event Traces
```typescript
{
  'security.event_type': 'canary_accessed' | 'api_probe_detected',
  'security.context': 'hidden_api_endpoint',
  'security.severity': 'high' | 'medium' | 'low',
  'security.ip': '192.168.1.100',
  'security.user_agent': 'Evil-Scanner/1.0',
  'security.session_id': 'session_12345',
  'security.attack_vector': 'api_enumeration',
  'security.alert_level': 'canary_triggered',
  'arize.model_id': 'security-canary-system',
  'arize.model_version': '1.0.0',
  timestamp: 1692748800000
}
```

### Arize Dashboard Configuration
**Model Setup:**
- Model Name: "AlphaForge Security Canary"
- Model Type: "Security Monitoring" 
- Model ID: "security-canary-system"
- Version: "1.0.0"

## Push Notification Types

### Real-time Alerts in Arize:
1. **Immediate Notifications:** Any canary trigger
2. **Anomaly Alerts:** Multiple triggers from same IP
3. **Pattern Detection:** Coordinated attacks
4. **Drift Monitoring:** New attack vectors

### Alert Severity Levels:
- **High:** Direct canary access (immediate notification)
- **Critical:** Multiple canaries triggered (emergency alert)
- **Coordinated:** Multiple IPs attacking (incident response)

## Benefits of Arize Integration

### Professional Security Operations:
- **Real-time Dashboard:** Live security event visualization
- **Anomaly Detection:** AI-powered threat pattern recognition
- **Incident Timeline:** Complete attack reconstruction
- **Forensic Analysis:** Evidence collection and correlation

### Advanced Features:
- **Drift Detection:** Identify new attack methods
- **Behavioral Analysis:** Learn normal vs. suspicious patterns
- **Correlation Engine:** Connect security events with business metrics
- **Automated Alerting:** Push notifications to security team

## Testing the Integration

### 1. After Adding Credentials
You'll see this startup message:
```
✅ Arize AI credentials detected - ready for cloud observability
```

### 2. Test Security Event
```bash
curl http://localhost:5000/api/admin
```

### 3. Check Arize Dashboard
- Login to your Arize AI account
- Navigate to Models → "security-canary-system"
- View real-time security traces
- Set up custom alerts and dashboards

## Cost Considerations

### Arize AI Pricing:
- **Starter:** Free tier available for small volumes
- **Professional:** $0.002 per trace (very cost-effective for security)
- **Enterprise:** Custom pricing for high-volume security monitoring

### Security Event Volume:
- Legitimate users: 0 security events
- Attack attempts: 1-10 events per incident
- Monthly cost: Typically <$10 for comprehensive security monitoring

## Alternative: Phoenix Local Server

### Free Option - Run Arize Phoenix Locally:
```bash
pip install arize-phoenix
phoenix serve --host 0.0.0.0 --port 6006
```

**Benefits:**
- Free local security monitoring
- Same dashboard capabilities
- No cloud dependency
- Complete data privacy

**Limitations:**
- No push notifications to mobile/email
- Manual monitoring required
- No advanced AI features

## Enabling Push Notifications Summary

**Current State:** Security events logged locally
**To Enable Arize Push:** Add 3 environment variables (ARIZE_API_KEY, ARIZE_SPACE_ID, ARIZE_ENDPOINT_URL)
**Result:** Real-time security notifications and professional monitoring dashboard

The system is already fully integrated and ready - you just need to provide your Arize AI credentials to enable push notifications and cloud monitoring.