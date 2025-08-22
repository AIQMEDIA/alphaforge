// Simple email test for AlphaForge
const nodemailer = require('nodemailer');

async function simpleEmailTest() {
  console.log('🔧 Testing email with current configuration...');
  console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`SMTP User: ${process.env.SMTP_USER}`);
  console.log(`Email From: ${process.env.EMAIL_FROM}`);
  console.log(`Email To: ${process.env.EMAIL_TO}`);
  
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
    // First verify SMTP connection
    console.log('🔌 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful');
    
    // Send simple test email
    console.log('📧 Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: 'AlphaForge Email Test - Executive Alert System Active',
      html: `
        <h2 style="color: #0066cc;">AlphaForge Email System Test</h2>
        <p><strong>Status:</strong> ✅ Email notifications are working!</p>
        
        <h3>Your Executive Alerts Are Now Active:</h3>
        <ul>
          <li>Daily compliance reports (6 AM)</li>
          <li>Weekly board summaries (Monday 8 AM)</li>
          <li>Critical security alerts (real-time)</li>
          <li>High-value business prospects (immediate)</li>
        </ul>
        
        <div style="background: #f0f8ff; padding: 15px; border-left: 4px solid #0066cc;">
          <h4>Sample Alert Format:</h4>
          <p><strong>🚨 Hedge Fund Detection</strong></p>
          <p><strong>Business Value:</strong> $480,000</p>
          <p><strong>Action Required:</strong> Executive review</p>
        </div>
        
        <p>Test completed at: ${new Date().toLocaleString()}</p>
        <p><em>AlphaForge Business Intelligence System</em></p>
      `
    });
    
    console.log('✅ Email sent successfully');
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log(`📬 Check your inbox: ${process.env.EMAIL_TO}`);
    return true;
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    return false;
  }
}

simpleEmailTest().then(success => {
  if (success) {
    console.log('\n🎉 Email system fully operational!');
  } else {
    console.log('\n❌ Email system needs configuration adjustment.');
  }
});