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
import { threatResponsePlaybook } from "./threatPlaybook";

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

// Enhanced competitor and testing activity detection
function detectSuspiciousActivity(userAgent: string, referer: string, ip: string): string[] {
  const indicators: string[] = [];
  
  // Check for known competitors and testing organizations
  const suspiciousKeywords = [
    'albion', 'trillium', 'trade desk', 'trading desk',
    'hedge fund', 'hedgefund', 'prop trading', 'proprietary',
    'quantconnect', 'quantopian', 'zipline', 'lean',
    'interactive brokers', 'alpaca', 'robinhood',
    'citadel', 'renaissance', 'two sigma', 'de shaw',
    'scrapy', 'selenium', 'playwright', 'puppeteer',
    'bot', 'crawler', 'spider', 'automated',
    'test', 'qa', 'quality assurance', 'penetration',
    'institutional', 'tradingbot', 'algo trading'
  ];
  
  const userAgentLower = userAgent.toLowerCase();
  const refererLower = referer.toLowerCase();
  
  // Check user agent
  suspiciousKeywords.forEach(keyword => {
    if (userAgentLower.includes(keyword)) {
      indicators.push(`suspicious_user_agent:${keyword}`);
    }
    if (refererLower.includes(keyword)) {
      indicators.push(`suspicious_referer:${keyword}`);
    }
  });
  
  // Check for automated testing patterns
  if (userAgentLower.includes('headless') || userAgentLower.includes('automation')) {
    indicators.push('automated_testing_detected');
  }
  
  // Check for known competitor IP ranges (placeholder - would need real data)
  if (ip.startsWith('192.168.') || ip.startsWith('10.')) {
    indicators.push('internal_network_testing');
  }
  
  return indicators;
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
    referer: req.get('Referer') || 'unknown',
    timestamp: new Date().toISOString()
  };

  // Check for suspicious activity indicators
  const suspiciousIndicators = detectSuspiciousActivity(
    metadata.userAgent, 
    metadata.referer, 
    metadata.ip
  );

  // Enhanced logging for competitor detection
  if (suspiciousIndicators.length > 0) {
    // Special handling for hedge fund detection
    const isHedgeFund = suspiciousIndicators.some(indicator => 
      indicator.includes('hedge') || indicator.includes('institutional') || 
      indicator.includes('tradingbot') || indicator.includes('proprietary')
    );
    
    if (isHedgeFund) {
      console.error(`🎯💰 HEDGE FUND INTELLIGENCE ALERT: Institutional entity detected`, {
        ...metadata,
        suspiciousIndicators,
        severity: 'high_value_target',
        alertType: 'hedge_fund_detection',
        businessOpportunity: 'institutional_prospect',
        recommendedAction: 'intelligence_gathering_and_business_development'
      });
      
      // Trigger automated threat response playbook for hedge fund detection
      threatResponsePlaybook.processSuspiciousTradingBot({
        sessionId: metadata.sessionId || 'unknown',
        userId: (metadata as any).userId,
        riskScore: 175, // High risk for hedge fund bots
        traderType: 'hedge_fund',
        businessValueScore: 160, // High business value for institutional prospects
        ipAddress: metadata.ip || 'unknown',
        userAgent: metadata.userAgent || 'unknown',
        suspiciousIndicators,
        detectedFeatures: ['quantum_algorithms', 'institutional_trading', 'competitive_analysis'],
        fullTrace: metadata,
        timestamp: new Date()
      }).catch(err => console.error('Threat playbook execution failed:', err));
      
    } else {
      console.error(`🚨🎯 CRITICAL SECURITY ALERT: Potential competitor/tester detected`, {
        ...metadata,
        suspiciousIndicators,
        severity: 'critical',
        alertType: 'competitor_detection',
        immediateResponse: 'required'
      });
      
      // Trigger automated threat response for general competitor detection
      threatResponsePlaybook.processSuspiciousTradingBot({
        sessionId: metadata.sessionId || 'unknown',
        userId: (metadata as any).userId,
        riskScore: 140, // High risk for competitors
        traderType: 'institutional',
        businessValueScore: 85, // Medium business value for general competitors
        ipAddress: metadata.ip || 'unknown',
        userAgent: metadata.userAgent || 'unknown',
        suspiciousIndicators,
        detectedFeatures: ['api_probing', 'system_analysis', 'competitive_research'],
        fullTrace: metadata,
        timestamp: new Date()
      }).catch(err => console.error('Threat playbook execution failed:', err));
    }
    
    // Special trace for competitor activity
    traceSecurityEvent('competitor_probe_detected', `HIGH-PRIORITY: ${req.path} accessed by suspicious entity`, {
      ...metadata,
      suspiciousIndicators,
      severity: 'critical',
      attack_vector: 'competitor_reconnaissance',
      endpoint_type: 'protected_canary',
      threat_level: 'immediate_attention_required'
    });
  }

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