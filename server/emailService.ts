// AlphaForge Email Service
// Handles weekly performance report emails and notifications

import { MailService } from '@sendgrid/mail';
import { performanceMonitor, PerformanceMetrics } from './performanceMonitoring.js';

export class EmailService {
  private mailService: MailService;
  private fromEmail: string = 'reports@alphaforge.app';
  private isConfigured: boolean = false;

  constructor() {
    this.mailService = new MailService();
    this.configure();
  }

  private configure() {
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (apiKey) {
      this.mailService.setApiKey(apiKey);
      this.isConfigured = true;
      console.log('✅ SendGrid email service configured');
    } else {
      console.log('⚠️  SendGrid API key not found - email reports will be logged only');
      this.isConfigured = false;
    }
  }

  async sendWeeklyReport(recipientEmail: string): Promise<boolean> {
    try {
      // Generate the weekly report
      const metrics = await performanceMonitor.generateWeeklyReport();
      const htmlContent = performanceMonitor.generateEmailReport(metrics);
      
      if (this.isConfigured) {
        // Send via SendGrid
        await this.mailService.send({
          to: recipientEmail,
          from: this.fromEmail,
          subject: `AlphaForge Weekly Performance Report - ${metrics.weekStart.toLocaleDateString()}`,
          html: htmlContent
        });
        
        console.log(`📧 Weekly report sent to ${recipientEmail}`);
        return true;
      } else {
        // Log report if email service not configured
        console.log('\n📊 WEEKLY PERFORMANCE REPORT');
        console.log('==============================');
        console.log(`Recipient: ${recipientEmail}`);
        console.log(`Week: ${metrics.weekStart.toLocaleDateString()} - ${metrics.weekEnd.toLocaleDateString()}`);
        console.log(`User Activity: ${metrics.userActivity.totalSessions} sessions, ${metrics.userActivity.uniqueUsers} unique users`);
        console.log(`Fraud Prevention: ${metrics.fraudPrevention.totalAttempts} attempts, ${metrics.fraudPrevention.blockedAttempts} blocked`);
        console.log(`Lead Generation: ${metrics.leadGeneration.totalCRMSubmissions} submissions, ${metrics.leadGeneration.conversionRate}% conversion`);
        console.log(`Growth: ${metrics.growthInsights.weekOverWeekGrowth}% week-over-week`);
        
        if (metrics.growthInsights.troubleshootingOpportunities.length > 0) {
          console.log('\n🔧 TROUBLESHOOTING OPPORTUNITIES:');
          metrics.growthInsights.troubleshootingOpportunities.forEach(item => {
            console.log(`  • ${item}`);
          });
        }
        
        if (metrics.growthInsights.recommendations.length > 0) {
          console.log('\n💡 RECOMMENDATIONS:');
          metrics.growthInsights.recommendations.forEach(item => {
            console.log(`  • ${item}`);
          });
        }
        
        console.log('\n📄 Full HTML report saved to console');
        console.log('To enable email delivery, add your SENDGRID_API_KEY to environment variables');
        
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to send weekly report:', error);
      return false;
    }
  }

  async sendTestEmail(recipientEmail: string): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        console.log(`⚠️  Email service not configured - test email would be sent to ${recipientEmail}`);
        return false;
      }

      await this.mailService.send({
        to: recipientEmail,
        from: this.fromEmail,
        subject: 'AlphaForge Email Service Test',
        html: `
          <h1>✅ Email Service Test Successful</h1>
          <p>This is a test email from your AlphaForge performance monitoring system.</p>
          <p>Weekly reports will be sent to this email address every Monday at 9:00 AM.</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        `
      });

      console.log(`📧 Test email sent successfully to ${recipientEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return false;
    }
  }

  getConfigurationStatus(): { 
    isConfigured: boolean; 
    message: string; 
    instructions?: string; 
  } {
    if (this.isConfigured) {
      return {
        isConfigured: true,
        message: 'Email service is fully configured and ready to send weekly reports'
      };
    } else {
      return {
        isConfigured: false,
        message: 'Email service is not configured - reports will be logged only',
        instructions: 'Add SENDGRID_API_KEY to your environment variables to enable email delivery'
      };
    }
  }
}

export const emailService = new EmailService();