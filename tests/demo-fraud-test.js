#!/usr/bin/env node
// Quick demonstration of fraud prevention testing capabilities
// Run with: node tests/demo-fraud-test.js

import FraudTestHelper from './utils/fraud-test-helper.js';

async function runFraudPreventionDemo() {
  console.log('🔒 AlphaForge Fraud Prevention System - Demo Test Suite');
  console.log('=====================================================\n');

  const fraudHelper = new FraudTestHelper();
  const results = {
    legitimate: [],
    fraudulent: [],
    blocked: 0,
    total: 0
  };

  try {
    // Test 1: Legitimate user behavior
    console.log('✅ Testing legitimate user behavior...');
    const legitimateUser = await fraudHelper.createLegitimateUser({
      name: 'John Professional',
      email: 'john.professional@tradingfirm.com',
      role: 'portfolio_manager',
      company: 'Professional Trading LLC'
    });
    
    results.legitimate.push(legitimateUser);
    results.total++;
    
    console.log(`   Risk Score: ${legitimateUser.riskScore || 0}`);
    console.log(`   Status: ${legitimateUser.success ? 'APPROVED' : 'REJECTED'}`);
    console.log(`   Blocked: ${legitimateUser.isBlocked ? 'YES' : 'NO'}\n`);

    // Test 2: Email aliasing fraud attempt
    console.log('🚨 Testing email aliasing fraud attempt...');
    const emailAliasingResult = await fraudHelper.simulateFraudulentAttempt('email_aliasing', {
      baseEmail: 'fraudster@gmail.com'
    });
    
    results.fraudulent.push(emailAliasingResult);
    results.blocked += emailAliasingResult.blocked;
    results.total += emailAliasingResult.attempts;
    
    console.log(`   Attempts: ${emailAliasingResult.attempts}`);
    console.log(`   Blocked: ${emailAliasingResult.blocked}`);
    console.log(`   Block Rate: ${(emailAliasingResult.blocked / emailAliasingResult.attempts * 100).toFixed(1)}%\n`);

    // Test 3: Rapid account creation
    console.log('🚨 Testing rapid account creation attack...');
    const rapidCreationResult = await fraudHelper.simulateFraudulentAttempt('rapid_creation', {
      count: 6,
      timeWindow: 30000 // 30 seconds
    });
    
    results.fraudulent.push(rapidCreationResult);
    results.blocked += rapidCreationResult.blocked;
    results.total += rapidCreationResult.attempts;
    
    console.log(`   Attempts: ${rapidCreationResult.attempts}`);
    console.log(`   Successful: ${rapidCreationResult.successfulCreations}`);
    console.log(`   Blocked: ${rapidCreationResult.blocked}`);
    console.log(`   Block Rate: ${(rapidCreationResult.blocked / rapidCreationResult.attempts * 100).toFixed(1)}%\n`);

    // Test 4: Disposable email detection
    console.log('🚨 Testing disposable email detection...');
    const disposableEmailResult = await fraudHelper.simulateFraudulentAttempt('disposable_email');
    
    results.fraudulent.push(disposableEmailResult);
    results.blocked += disposableEmailResult.blocked;
    results.total += disposableEmailResult.attempts;
    
    console.log(`   Attempts: ${disposableEmailResult.attempts}`);
    console.log(`   Blocked: ${disposableEmailResult.blocked}`);
    console.log(`   Block Rate: ${(disposableEmailResult.blocked / disposableEmailResult.attempts * 100).toFixed(1)}%\n`);

    // Test 5: Bot behavior detection
    console.log('🚨 Testing bot behavior detection...');
    const botBehaviorResult = await fraudHelper.simulateFraudulentAttempt('bot_behavior', {
      messageCount: 12,
      delay: 150 // Very rapid messaging
    });
    
    results.fraudulent.push(botBehaviorResult);
    if (botBehaviorResult.rateLimited || botBehaviorResult.blocked) {
      results.blocked++;
    }
    results.total++;
    
    console.log(`   Messages Attempted: ${botBehaviorResult.messagesSent || 'N/A'}`);
    console.log(`   Rate Limited: ${botBehaviorResult.rateLimited ? 'YES' : 'NO'}`);
    console.log(`   Blocked: ${botBehaviorResult.blocked ? 'YES' : 'NO'}\n`);

    // Performance test
    console.log('⚡ Testing system performance under load...');
    const loadTestResult = await fraudHelper.loadTest({
      concurrent: 3,
      duration: 5000, // 5 seconds
      requestsPerSecond: 2
    });
    
    console.log(`   Total Requests: ${loadTestResult.totalRequests}`);
    console.log(`   Successful: ${loadTestResult.successfulRequests}`);
    console.log(`   Failed: ${loadTestResult.failedRequests}`);
    console.log(`   Avg Response Time: ${loadTestResult.averageResponseTime?.toFixed(0) || 'N/A'}ms`);
    console.log(`   Success Rate: ${((loadTestResult.successfulRequests / loadTestResult.totalRequests) * 100).toFixed(1)}%\n`);

    // Final summary
    console.log('📊 FRAUD PREVENTION SYSTEM SUMMARY');
    console.log('=====================================');
    console.log(`Total Test Scenarios: ${results.legitimate.length + results.fraudulent.length + 1}`);
    console.log(`Legitimate Users Tested: ${results.legitimate.length}`);
    console.log(`Fraudulent Attempts: ${results.total - results.legitimate.length}`);
    console.log(`Blocked Attempts: ${results.blocked}`);
    console.log(`Overall Block Rate: ${results.total > 0 ? ((results.blocked / (results.total - results.legitimate.length)) * 100).toFixed(1) : 0}%`);
    console.log(`System Status: ${results.blocked > 0 ? '🛡️  PROTECTED' : '⚠️  NEEDS REVIEW'}`);

    // Recommendations
    console.log('\n🔧 SECURITY RECOMMENDATIONS:');
    if (results.blocked < (results.total - results.legitimate.length) * 0.5) {
      console.log('   • Consider lowering fraud detection thresholds');
      console.log('   • Add additional email domain blacklists');
      console.log('   • Implement stricter rate limiting');
    } else {
      console.log('   • Fraud prevention system is working effectively');
      console.log('   • Continue monitoring for new attack patterns');
      console.log('   • Consider A/B testing stricter policies');
    }

    console.log('\n✅ Demo completed successfully!');
    console.log('📄 Full test suite available in: tests/fraud-prevention/comprehensive.spec.js');
    console.log('📋 Complete documentation: tests/fraud-prevention-test-suite.md');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Ensure the development server is running: npm run dev');
    console.log('   • Check database connection');
    console.log('   • Verify fraud prevention routes are accessible');
  }
}

// Run the demo
runFraudPreventionDemo();