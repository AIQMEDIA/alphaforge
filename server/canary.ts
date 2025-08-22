/*
 * AlphaForge - Security Canary System
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Security monitoring and intrusion detection system.
 * Unauthorized access, copying, or distribution is strictly prohibited.
 */

import { fraudPreventionService } from "./fraudPrevention";
import { traceUserAction, traceSecurityEvent } from "./observability";

interface SecurityAlert {
  type: string;
  timestamp: Date;
  context: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// This is a fake "hidden" function. Legitimate code never calls this directly.
export function canaryAccessed(context: string, metadata?: any) {
  const alert: SecurityAlert = {
    type: "canary_accessed",
    timestamp: new Date(),
    context,
    ip: metadata?.ip || "unknown",
    userAgent: metadata?.userAgent || "unknown",
    sessionId: metadata?.sessionId || "unknown",
    severity: 'high'
  };
  
  // Send security alert
  sendSecurityAlert(alert);
  
  // Integrate with existing fraud prevention
  if (metadata?.ip) {
    // Record suspicious activity through fraud prevention system
    console.warn(`🚨 Security canary triggered from IP: ${metadata.ip}`);
  }
  
  // Log to Arize Phoenix observability system
  traceSecurityEvent('canary_accessed', context, {
    severity: 'high',
    ip: metadata?.ip,
    userAgent: metadata?.userAgent,
    sessionId: metadata?.sessionId,
    timestamp: new Date().toISOString(),
    alert_priority: 'immediate_investigation'
  });
  
  // Optionally: slow down response, fuzz data, or escalate security measures
  setTimeout(() => {
    console.warn(`🚨 SECURITY CANARY TRIGGERED: ${context} from ${metadata?.ip || 'unknown'}`);
  }, Math.random() * 2000 + 1000); // Random delay 1-3 seconds
}

export function sendSecurityAlert(alert: SecurityAlert) {
  // Log security alert
  console.error('🔒 SECURITY ALERT:', {
    type: alert.type,
    timestamp: alert.timestamp.toISOString(),
    context: alert.context,
    ip: alert.ip,
    severity: alert.severity
  });
  
  // In production, this would:
  // - Send to security monitoring service
  // - Alert security team via email/SMS
  // - Create incident in security system
  // - Trigger automated response procedures
  
  // For now, log security incidents for manual review
  if (alert.ip && alert.ip !== 'unknown') {
    console.error(`🔒 SECURITY INCIDENT: IP ${alert.ip} triggered security canary: ${alert.context}`);
    // In production, this would trigger automated security response
  }
}

// Hidden API endpoint canary - if accessed, someone is probing
export function apiCanaryTriggered(req: any) {
  const metadata = {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    sessionId: req.sessionID,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  };

  canaryAccessed('hidden_api_endpoint', metadata);
  
  // Send specific security event to Arize for API probing detection
  traceSecurityEvent('api_probe_detected', `Unauthorized access to ${req.path}`, {
    ...metadata,
    severity: 'high',
    attack_vector: 'api_enumeration',
    endpoint_type: 'protected_canary'
  });
  
  // Return fake data to confuse attackers
  return {
    status: 'maintenance',
    message: 'Service temporarily unavailable',
    retry_after: Math.floor(Math.random() * 3600) + 300 // Random 5-65 minutes
  };
}

// Code inspection canary - if certain internal functions are called unexpectedly
export function codeInspectionCanary(functionName: string, stackTrace?: string) {
  canaryAccessed('code_inspection_detected', {
    functionName,
    stackTrace: stackTrace?.substring(0, 500), // Limit stack trace length
    timestamp: new Date().toISOString()
  });
}

// Configuration access canary - if sensitive config is accessed
export function configAccessCanary(configKey: string, accessContext: string) {
  canaryAccessed('config_access_anomaly', {
    configKey,
    accessContext,
    timestamp: new Date().toISOString()
  });
}

// Database query canary - if suspicious database operations occur
export function databaseCanary(query: string, operation: string) {
  canaryAccessed('suspicious_database_activity', {
    operation,
    query: query.substring(0, 200), // Limit query length in logs
    timestamp: new Date().toISOString()
  });
}

// Export for use in other security modules
export const securityCanaries = {
  apiAccess: apiCanaryTriggered,
  codeInspection: codeInspectionCanary,
  configAccess: configAccessCanary,
  databaseQuery: databaseCanary
};