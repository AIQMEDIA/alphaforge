// Comprehensive fraud prevention service for AlphaForge
// Prevents dishonest users from gaming the system with multiple accounts

import { createHash } from "crypto";
import { db } from "./db";
import { fraudPrevention, accountVerifications, users, crmLeads } from "@shared/schema";
import { eq, and, gte, desc, count, sql } from "drizzle-orm";

interface BrowserFingerprint {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  cookieEnabled: boolean;
  doNotTrack: string;
  canvas?: string;
  webgl?: string;
  fonts?: string[];
}

interface FraudCheckResult {
  riskScore: number;
  isBlocked: boolean;
  flaggedReasons: string[];
  recommendations: string[];
}

export class FraudPreventionService {
  
  /**
   * Generate a unique browser fingerprint to track devices across sessions
   */
  generateFingerprint(data: BrowserFingerprint, ipAddress: string): string {
    const fingerprintData = {
      userAgent: data.userAgent,
      language: data.language,
      platform: data.platform,
      screenResolution: data.screenResolution,
      timezone: data.timezone,
      canvas: data.canvas,
      webgl: data.webgl,
      ipAddress: ipAddress.split('.').slice(0, 3).join('.'), // Partial IP for privacy
    };
    
    return createHash('sha256')
      .update(JSON.stringify(fingerprintData))
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Comprehensive fraud risk assessment
   */
  async assessFraudRisk(
    fingerprint: string,
    ipAddress: string,
    userAgent: string,
    email?: string,
    phone?: string
  ): Promise<FraudCheckResult> {
    
    const flaggedReasons: string[] = [];
    let riskScore = 0;

    // Check 1: Multiple accounts from same fingerprint
    const fingerprintCount = await db
      .select({ count: count() })
      .from(fraudPrevention)
      .where(eq(fraudPrevention.fingerprint, fingerprint))
      .then(result => result[0]?.count || 0);

    if (fingerprintCount >= 3) {
      riskScore += 40;
      flaggedReasons.push("Multiple accounts from same device/browser");
    } else if (fingerprintCount >= 2) {
      riskScore += 20;
      flaggedReasons.push("Duplicate device detected");
    }

    // Check 2: Multiple accounts from same IP address (within 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const ipCount = await db
      .select({ count: count() })
      .from(fraudPrevention)
      .where(and(
        eq(fraudPrevention.ipAddress, ipAddress),
        gte(fraudPrevention.createdAt, yesterday)
      ))
      .then(result => result[0]?.count || 0);

    if (ipCount >= 5) {
      riskScore += 35;
      flaggedReasons.push("Suspicious IP activity - too many accounts");
    } else if (ipCount >= 3) {
      riskScore += 15;
      flaggedReasons.push("Multiple accounts from same IP");
    }

    // Check 3: Email similarity check
    if (email) {
      const emailDomain = email.split('@')[1];
      const baseEmail = email.split('+')[0]; // Remove + aliases

      const similarEmails = await db
        .select()
        .from(fraudPrevention)
        .where(sql`email ILIKE ${`%${emailDomain}%`}`)
        .limit(10);

      // Check for email aliases (gmail+alias, disposable emails)
      const suspiciousPatterns = [
        /\+.*@/, // Email aliases
        /@(10minutemail|guerrillamail|tempmail|mailinator)/, // Disposable emails
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(email))) {
        riskScore += 25;
        flaggedReasons.push("Suspicious email pattern detected");
      }

      // Check for similar base emails
      const similarBaseEmails = similarEmails.filter(record => 
        record.email && record.email.split('+')[0] === baseEmail
      );

      if (similarBaseEmails.length >= 2) {
        riskScore += 30;
        flaggedReasons.push("Email aliases detected");
      }
    }

    // Check 4: Phone number verification
    if (phone) {
      const phoneCount = await db
        .select({ count: count() })
        .from(fraudPrevention)
        .where(eq(fraudPrevention.phoneNumber, phone))
        .then(result => result[0]?.count || 0);

      if (phoneCount >= 3) {
        riskScore += 35;
        flaggedReasons.push("Phone number used multiple times");
      }
    }

    // Check 5: User agent analysis
    const commonBotPatterns = [
      /bot|crawler|spider|scraper/i,
      /headless|phantom|selenium/i,
      /curl|wget|http/i
    ];

    if (commonBotPatterns.some(pattern => pattern.test(userAgent))) {
      riskScore += 50;
      flaggedReasons.push("Automated/bot traffic detected");
    }

    // Check 6: Rapid account creation pattern
    const recentAccounts = await db
      .select()
      .from(fraudPrevention)
      .where(and(
        eq(fraudPrevention.fingerprint, fingerprint),
        gte(fraudPrevention.createdAt, yesterday)
      ))
      .limit(5);

    if (recentAccounts.length >= 3) {
      riskScore += 45;
      flaggedReasons.push("Rapid account creation detected");
    }

    // Determine if account should be blocked
    const isBlocked = riskScore >= 70;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (riskScore >= 30) {
      recommendations.push("Require email verification");
      recommendations.push("Require phone verification");
    }
    
    if (riskScore >= 50) {
      recommendations.push("Manual review required");
      recommendations.push("Limit trial features");
    }
    
    if (riskScore >= 70) {
      recommendations.push("Block account creation");
      recommendations.push("Flag for investigation");
    }

    return {
      riskScore,
      isBlocked,
      flaggedReasons,
      recommendations
    };
  }

  /**
   * Record fraud prevention data for tracking
   */
  async recordFraudData(data: {
    fingerprint: string;
    ipAddress: string;
    userAgent: string;
    sessionId?: string;
    userId?: string;
    email?: string;
    phoneNumber?: string;
    deviceId?: string;
    browserFingerprint?: BrowserFingerprint;
    riskScore: number;
    flaggedReason?: string;
    isBlocked: boolean;
  }) {
    await db.insert(fraudPrevention).values({
      ...data,
      browserFingerprint: data.browserFingerprint ? JSON.stringify(data.browserFingerprint) : null,
    });
  }

  /**
   * Enhanced email verification with fraud prevention
   */
  async verifyEmail(email: string, userId?: string): Promise<boolean> {
    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== userId) {
      return false; // Email already in use
    }

    // Additional verification logic would go here
    // (Send verification email, check domain validity, etc.)
    
    return true;
  }

  /**
   * Phone verification with SMS
   */
  async verifyPhone(phone: string): Promise<boolean> {
    // Phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return false;
    }

    // Check for excessive use of this phone number
    const phoneUsage = await db
      .select({ count: count() })
      .from(fraudPrevention)
      .where(eq(fraudPrevention.phoneNumber, phone))
      .then(result => result[0]?.count || 0);

    return phoneUsage < 3; // Allow up to 3 accounts per phone
  }

  /**
   * Trial abuse prevention - enhanced limits
   */
  async checkTrialEligibility(
    fingerprint: string,
    ipAddress: string,
    email?: string
  ): Promise<{
    eligible: boolean;
    reason?: string;
    alternativeOffer?: string;
  }> {
    
    // Check previous trials from same fingerprint
    const previousTrials = await db
      .select()
      .from(users)
      .innerJoin(fraudPrevention, eq(users.id, fraudPrevention.userId))
      .where(eq(fraudPrevention.fingerprint, fingerprint))
      .limit(5);

    if (previousTrials.length >= 2) {
      return {
        eligible: false,
        reason: "Trial limit reached for this device",
        alternativeOffer: "Contact sales for enterprise demo"
      };
    }

    // Check IP-based trial abuse
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const ipTrials = await db
      .select()
      .from(fraudPrevention)
      .where(and(
        eq(fraudPrevention.ipAddress, ipAddress),
        gte(fraudPrevention.createdAt, last7Days)
      ))
      .limit(10);

    if (ipTrials.length >= 3) {
      return {
        eligible: false,
        reason: "Too many trials from this location",
        alternativeOffer: "Verify phone number for trial access"
      };
    }

    return { eligible: true };
  }

  /**
   * Generate fraud prevention report for admins
   */
  async generateFraudReport(days: number = 30): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [
      totalAttempts,
      blockedAttempts,
      flaggedReasons,
      topIPs,
      topFingerprints
    ] = await Promise.all([
      // Total attempts
      db.select({ count: count() })
        .from(fraudPrevention)
        .where(gte(fraudPrevention.createdAt, since))
        .then(result => result[0]?.count || 0),

      // Blocked attempts
      db.select({ count: count() })
        .from(fraudPrevention)
        .where(and(
          gte(fraudPrevention.createdAt, since),
          eq(fraudPrevention.isBlocked, true)
        ))
        .then(result => result[0]?.count || 0),

      // Top flagged reasons
      db.select({
        reason: fraudPrevention.flaggedReason,
        count: count()
      })
        .from(fraudPrevention)
        .where(gte(fraudPrevention.createdAt, since))
        .groupBy(fraudPrevention.flaggedReason)
        .orderBy(desc(count()))
        .limit(10),

      // Top suspicious IPs
      db.select({
        ip: fraudPrevention.ipAddress,
        count: count(),
        avgRiskScore: sql<number>`avg(${fraudPrevention.riskScore})`
      })
        .from(fraudPrevention)
        .where(gte(fraudPrevention.createdAt, since))
        .groupBy(fraudPrevention.ipAddress)
        .having(sql`count(*) > 2`)
        .orderBy(desc(count()))
        .limit(10),

      // Top suspicious fingerprints
      db.select({
        fingerprint: fraudPrevention.fingerprint,
        count: count(),
        avgRiskScore: sql<number>`avg(${fraudPrevention.riskScore})`
      })
        .from(fraudPrevention)
        .where(gte(fraudPrevention.createdAt, since))
        .groupBy(fraudPrevention.fingerprint)
        .having(sql`count(*) > 1`)
        .orderBy(desc(count()))
        .limit(10)
    ]);

    return {
      period: `Last ${days} days`,
      summary: {
        totalAttempts,
        blockedAttempts,
        blockRate: totalAttempts > 0 ? (blockedAttempts / totalAttempts * 100).toFixed(1) : 0
      },
      flaggedReasons,
      suspiciousIPs: topIPs,
      suspiciousFingerprints: topFingerprints,
      generatedAt: new Date().toISOString()
    };
  }
}

export const fraudPreventionService = new FraudPreventionService();