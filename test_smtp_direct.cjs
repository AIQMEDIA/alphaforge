// Direct SMTP test for AlphaForge email notifications
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🔧 Testing SMTP email configuration...');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  try {
    // Test connection
    await transporter.verify();
    console.log('✅ SMTP server connection verified');
    
    // Send test email
    const testEmail = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: '🚨 AlphaForge SMTP Test - Executive Alert System',
      html: `
        <h2 style="color: #cc0000;">AlphaForge Executive Alert System</h2>
        <h3 style="color: #007600;">✅ SMTP Configuration Successful</h3>
        
        <p><strong>Your email notification system is now active!</strong></p>
        
        <h4>What you'll receive:</h4>
        <ul>
          <li><strong>Daily Reports (6 AM):</strong> Security summaries with business intelligence</li>
          <li><strong>Weekly Reports (Monday 8 AM):</strong> Board-level analysis and revenue pipeline</li>
          <li><strong>Critical Alerts (Real-time):</strong> High-value prospects and security incidents</li>
        </ul>
        
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #cc0000;">
          <h4>Sample Critical Alert:</h4>
          <p><strong>🚨 Hedge Fund Detection</strong></p>
          <p><strong>Business Value:</strong> $480,000</p>
          <p><strong>Risk Score:</strong> 175/200</p>
          <p><strong>Action Required:</strong> Immediate executive review</p>
        </div>
        
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>SMTP Host: ${process.env.SMTP_HOST}</li>
          <li>From: ${process.env.EMAIL_FROM}</li>
          <li>To: ${process.env.EMAIL_TO}</li>
          <li>Test Time: ${new Date().toLocaleString()}</li>
        </ul>
        
        <p><em>This confirms your AlphaForge email system is operational.</em></p>
      `
    };
    
    await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully');
    console.log(`📧 Check ${process.env.EMAIL_TO} for the test message`);
    return true;
  } catch (error) {
    console.error('❌ SMTP test failed:', error.message);
    return false;
  }
}

testSMTP().then(success => {
  if (success) {
    console.log('\n🎉 Email system is ready for executive alerts!');
  } else {
    console.log('\n❌ Please check your SMTP credentials and try again.');
  }
  process.exit(success ? 0 : 1);
});