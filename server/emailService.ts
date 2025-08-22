// AlphaForge Email Service
// Handles weekly performance report emails and notifications

import * as nodemailer from 'nodemailer';
import { performanceMonitor, PerformanceMetrics } from './performanceMonitoring.js';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;
  private isConfigured: boolean = false;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'reports@alphaforge.app';
    this.configure();
  }

  private configure() {
    // Check for SMTP configuration first
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = process.env.SMTP_PORT;
    
    if (smtpHost && smtpUser && smtpPass) {
      // Use SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      this.isConfigured = true;
      console.log('✅ SMTP email service configured');
    } else {
      // Fallback to SendGrid if SMTP not available
      const apiKey = process.env.SENDGRID_API_KEY;
      if (apiKey) {
        const { MailService } = require('@sendgrid/mail');
        const mailService = new MailService();
        mailService.setApiKey(apiKey);
        // Create a wrapper for SendGrid to match nodemailer interface
        this.transporter = {
          sendMail: async (mailOptions: any) => {
            await mailService.send({
              to: mailOptions.to,
              from: mailOptions.from,
              subject: mailOptions.subject,
              html: mailOptions.html
            });
          }
        } as any;
        this.isConfigured = true;
        console.log('✅ SendGrid email service configured');
      } else {
        console.log('⚠️  No email service configured - reports will be logged only');
        this.isConfigured = false;
      }
    }
  }

  async sendWeeklyReport(recipientEmail: string): Promise<boolean> {
    try {
      // Generate the weekly report
      const metrics = await performanceMonitor.generateWeeklyReport();
      const htmlContent = performanceMonitor.generateEmailReport(metrics);
      
      if (this.isConfigured && this.transporter) {
        // Send via configured transport (SMTP or SendGrid)
        await this.transporter.sendMail({
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
        console.log('To enable email delivery, add SMTP credentials or SENDGRID_API_KEY to environment variables');
        
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to send weekly report:', error);
      return false;
    }
  }

  async sendTestEmail(recipientEmail: string): Promise<boolean> {
    try {
      if (!this.isConfigured || !this.transporter) {
        console.log(`⚠️  Email service not configured - test email would be sent to ${recipientEmail}`);
        return false;
      }

      await this.transporter.sendMail({
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
        instructions: 'Add SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) or SENDGRID_API_KEY to your environment variables to enable email delivery'
      };
    }
  }
}

export const emailService = new EmailService();