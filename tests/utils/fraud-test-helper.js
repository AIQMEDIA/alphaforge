// Fraud Prevention Test Helper Utilities
// Provides comprehensive testing tools for AlphaForge fraud prevention system

import { createHash } from 'crypto';
import axios from 'axios';

export class FraudTestHelper {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.testData = {
      legitimateUsers: [],
      fraudulentAttempts: [],
      testSessions: []
    };
  }

  // Device fingerprinting simulation
  generateFingerprint(options = {}) {
    const defaultFingerprint = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      language: 'en-US',
      platform: 'Win32',
      screenResolution: '1920x1080',
      timezone: 'America/New_York',
      cookieEnabled: true,
      doNotTrack: 'unspecified'
    };

    const fingerprint = { ...defaultFingerprint, ...options };
    const fingerprintData = JSON.stringify(fingerprint);
    
    return createHash('sha256')
      .update(fingerprintData)
      .digest('hex')
      .substring(0, 16);
  }

  // Simulate legitimate user behavior
  async createLegitimateUser(profile = {}) {
    const defaultProfile = {
      name: `User${Date.now()}`,
      email: `user${Date.now()}@example.com`,
      role: 'trader',
      tradingExperience: 'intermediate',
      company: 'Example Corp',
      phone: '+15551234567'
    };

    const userProfile = { ...defaultProfile, ...profile };
    
    try {
      // Create session
      const sessionResponse = await axios.get(`${this.baseURL}/api/chat/session`);
      
      // Simulate human-like interaction timing
      await this.delay(this.randomDelay(1000, 3000));
      
      // Send a few messages before submitting CRM
      await this.sendMessage(sessionResponse.data.id, 'Hello, I\'m interested in quantum trading');
      await this.delay(this.randomDelay(2000, 5000));
      
      await this.sendMessage(sessionResponse.data.id, 'Can you tell me more about portfolio optimization?');
      await this.delay(this.randomDelay(1500, 4000));
      
      // Submit CRM form
      const crmResponse = await axios.post(`${this.baseURL}/api/chat/submit-crm`, userProfile);
      
      this.testData.legitimateUsers.push({
        profile: userProfile,
        sessionId: sessionResponse.data.id,
        result: crmResponse.data,
        timestamp: new Date()
      });
      
      return {
        success: crmResponse.data.success,
        riskScore: 0, // Legitimate users should have low risk
        isBlocked: false,
        sessionId: sessionResponse.data.id
      };
      
    } catch (error) {
      console.error('Error creating legitimate user:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Simulate fraudulent behavior patterns
  async simulateFraudulentAttempt(attackType = 'email_aliasing', options = {}) {
    const attacks = {
      email_aliasing: () => this.emailAliasingAttack(options),
      rapid_creation: () => this.rapidAccountCreation(options),
      ip_rotation: () => this.ipRotationAttack(options),
      bot_behavior: () => this.botBehaviorAttack(options),
      phone_recycling: () => this.phoneRecyclingAttack(options),
      disposable_email: () => this.disposableEmailAttack(options)
    };

    if (!attacks[attackType]) {
      throw new Error(`Unknown attack type: ${attackType}`);
    }

    return await attacks[attackType]();
  }

  // Email aliasing attack simulation
  async emailAliasingAttack(options = {}) {
    const baseEmail = options.baseEmail || 'fraudster@gmail.com';
    const aliases = [
      `${baseEmail.split('@')[0]}+1@${baseEmail.split('@')[1]}`,
      `${baseEmail.split('@')[0]}+trial@${baseEmail.split('@')[1]}`,
      `${baseEmail.split('@')[0]}+free@${baseEmail.split('@')[1]}`,
      baseEmail.replace('@', '+alias@')
    ];

    const results = [];
    
    for (const alias of aliases) {
      try {
        const result = await this.createAccount({
          email: alias,
          name: `User${Date.now()}${Math.random()}`,
          phone: this.generateRandomPhone()
        });
        results.push(result);
        
        // Small delay between attempts
        await this.delay(500);
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return {
      attackType: 'email_aliasing',
      attempts: aliases.length,
      results,
      blocked: results.filter(r => r.isBlocked).length
    };
  }

  // Rapid account creation simulation
  async rapidAccountCreation(options = {}) {
    const accountCount = options.count || 10;
    const timeWindow = options.timeWindow || 60000; // 1 minute
    const delayBetween = timeWindow / accountCount;

    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < accountCount; i++) {
      try {
        const result = await this.createAccount({
          email: `rapid${i}${Date.now()}@example.com`,
          name: `RapidUser${i}`,
          phone: this.generateRandomPhone()
        });
        
        results.push({
          ...result,
          attemptNumber: i + 1,
          timeFromStart: Date.now() - startTime
        });
        
        await this.delay(delayBetween);
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message,
          attemptNumber: i + 1 
        });
      }
    }

    return {
      attackType: 'rapid_creation',
      attempts: accountCount,
      timeWindow,
      results,
      successfulCreations: results.filter(r => r.success).length,
      blocked: results.filter(r => r.isBlocked).length
    };
  }

  // Bot behavior simulation
  async botBehaviorAttack(options = {}) {
    const messageCount = options.messageCount || 20;
    const rapidFireDelay = options.delay || 100; // Very fast messaging

    try {
      const sessionResponse = await axios.get(`${this.baseURL}/api/chat/session`);
      const sessionId = sessionResponse.data.id;

      const messages = [];
      for (let i = 0; i < messageCount; i++) {
        try {
          const result = await this.sendMessage(sessionId, `Bot message ${i}`);
          messages.push(result);
          await this.delay(rapidFireDelay);
        } catch (error) {
          messages.push({ error: error.message, messageNumber: i });
          break;
        }
      }

      return {
        attackType: 'bot_behavior',
        sessionId,
        messagesSent: messages.length,
        rateLimited: messages.some(m => m.rateLimited),
        blocked: messages.some(m => m.blocked)
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Disposable email attack
  async disposableEmailAttack(options = {}) {
    const disposableDomains = [
      '10minutemail.com',
      'guerrillamail.com',
      'tempmail.lol',
      'mailinator.com',
      'throwaway.email',
      'temp-mail.org'
    ];

    const results = [];
    
    for (const domain of disposableDomains) {
      const email = `test${Date.now()}@${domain}`;
      try {
        const result = await this.createAccount({ email });
        results.push({ email, ...result });
      } catch (error) {
        results.push({ email, success: false, error: error.message });
      }
    }

    return {
      attackType: 'disposable_email',
      attempts: disposableDomains.length,
      results,
      blocked: results.filter(r => r.riskScore > 50).length
    };
  }

  // Utility methods
  async createAccount(userData = {}) {
    const defaultUser = {
      name: `TestUser${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      role: 'trader',
      tradingExperience: 'beginner',
      company: 'Test Company'
    };

    const user = { ...defaultUser, ...userData };

    try {
      // Get session
      const sessionResponse = await axios.get(`${this.baseURL}/api/chat/session`);
      
      // Submit CRM
      const crmResponse = await axios.post(`${this.baseURL}/api/chat/submit-crm`, user);
      
      return {
        success: crmResponse.data.success,
        riskScore: crmResponse.data.riskScore || 0,
        isBlocked: crmResponse.data.requiresVerification || false,
        sessionId: sessionResponse.data.id,
        userData: user
      };
      
    } catch (error) {
      const errorData = error.response?.data || {};
      return {
        success: false,
        error: error.message,
        isBlocked: error.response?.status === 403,
        riskScore: 100, // Assume high risk if blocked
        errorDetails: errorData
      };
    }
  }

  async sendMessage(sessionId, message, options = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/api/chat/send`, {
        message,
        skillLevel: options.skillLevel || 'beginner'
      });

      return {
        success: true,
        response: response.data.response,
        rateLimited: response.data.rateLimited,
        limitReached: response.data.limitReached
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        rateLimited: error.response?.status === 429,
        blocked: error.response?.status === 403
      };
    }
  }

  async validateEmail(email, baseEmail = null) {
    // Simulate email validation logic
    const isAlias = baseEmail && this.detectEmailAlias(email, baseEmail);
    const isDisposable = this.isDisposableEmail(email);
    
    let riskScore = 0;
    if (isAlias) riskScore += 30;
    if (isDisposable) riskScore += 40;
    
    return {
      email,
      isAlias,
      isDisposable,
      riskScore,
      valid: riskScore < 50
    };
  }

  detectEmailAlias(email, baseEmail) {
    const emailParts = email.split('@');
    const baseParts = baseEmail.split('@');
    
    if (emailParts[1] !== baseParts[1]) return false; // Different domains
    
    // Check for + aliases
    if (emailParts[0].includes('+') && emailParts[0].split('+')[0] === baseParts[0]) {
      return true;
    }
    
    // Check for dot aliases (Gmail)
    const cleanEmail = emailParts[0].replace(/\./g, '');
    const cleanBase = baseParts[0].replace(/\./g, '');
    
    return cleanEmail === cleanBase && emailParts[0] !== baseParts[0];
  }

  isDisposableEmail(email) {
    const disposableDomains = [
      '10minutemail', 'guerrillamail', 'tempmail', 'mailinator', 
      'throwaway', 'temp-mail', 'yopmail', 'maildrop'
    ];
    
    return disposableDomains.some(domain => email.includes(domain));
  }

  generateRandomPhone() {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `+1${areaCode}${exchange}${number}`;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Test data management
  clearTestData() {
    this.testData = {
      legitimateUsers: [],
      fraudulentAttempts: [],
      testSessions: []
    };
  }

  getTestSummary() {
    return {
      legitimateUsers: this.testData.legitimateUsers.length,
      fraudulentAttempts: this.testData.fraudulentAttempts.length,
      testSessions: this.testData.testSessions.length,
      timestamp: new Date()
    };
  }

  // Performance testing utilities
  async loadTest(options = {}) {
    const concurrent = options.concurrent || 10;
    const duration = options.duration || 60000; // 1 minute
    const requestsPerSecond = options.requestsPerSecond || 5;
    
    const startTime = Date.now();
    const results = [];
    
    const makeRequest = async () => {
      try {
        const start = Date.now();
        const response = await axios.get(`${this.baseURL}/api/chat/session`);
        const responseTime = Date.now() - start;
        
        results.push({
          success: true,
          responseTime,
          timestamp: Date.now()
        });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          timestamp: Date.now()
        });
      }
    };

    // Create concurrent workers
    const workers = Array(concurrent).fill().map(async () => {
      while (Date.now() - startTime < duration) {
        await makeRequest();
        await this.delay(1000 / requestsPerSecond);
      }
    });

    await Promise.all(workers);

    return {
      duration: Date.now() - startTime,
      totalRequests: results.length,
      successfulRequests: results.filter(r => r.success).length,
      failedRequests: results.filter(r => !r.success).length,
      averageResponseTime: results
        .filter(r => r.responseTime)
        .reduce((sum, r) => sum + r.responseTime, 0) / results.filter(r => r.responseTime).length,
      results
    };
  }
}

export default FraudTestHelper;