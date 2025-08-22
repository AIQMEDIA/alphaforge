/*
 * AlphaForge - Free Notification System
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Multi-channel notification system using free services (Slack, Email, Discord).
 * Unauthorized access, copying, or distribution is strictly prohibited.
 */

import axios from 'axios';

interface NotificationPayload {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sessionId?: string;
  riskScore?: number;
  businessValue?: number;
  metadata?: any;
}

export class FreeNotificationSystem {
  private slackWebhook: string | undefined;
  private discordWebhook: string | undefined;
  private emailConfig: any;
  
  constructor() {
    this.slackWebhook = process.env.SLACK_WEBHOOK_URL;
    this.discordWebhook = process.env.DISCORD_WEBHOOK_URL;
    this.emailConfig = {
      enabled: !!process.env.SMTP_HOST,
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || 'alerts@alpha-forge.io'
    };
    
    this.logConfiguration();
  }
  
  private logConfiguration(): void {
    console.log('📢 Free Notification System initialized:', {
      slack: !!this.slackWebhook,
      discord: !!this.discordWebhook,
      email: this.emailConfig.enabled
    });
  }
  
  // Main notification dispatcher
  public async sendAlert(payload: NotificationPayload): Promise<void> {
    const promises: Promise<void>[] = [];
    
    // Send to all configured channels based on severity
    if (payload.severity === 'critical' || payload.severity === 'high') {
      if (this.slackWebhook) promises.push(this.sendSlackAlert(payload));
      if (this.discordWebhook) promises.push(this.sendDiscordAlert(payload));
      if (this.emailConfig.enabled) promises.push(this.sendEmailAlert(payload));
    } else {
      // Medium and low severity - Slack only
      if (this.slackWebhook) promises.push(this.sendSlackAlert(payload));
    }
    
    // Console alert always
    this.sendConsoleAlert(payload);
    
    // Execute all notifications in parallel
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }
  
  // Slack webhook notifications (FREE)
  private async sendSlackAlert(payload: NotificationPayload): Promise<void> {
    if (!this.slackWebhook) return;
    
    const severityEmoji = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🚨'
    };
    
    const color = {
      low: '#36a64f',
      medium: '#ffcc00',
      high: '#ff6600',
      critical: '#ff0000'
    };
    
    const slackMessage = {
      text: `${severityEmoji[payload.severity]} AlphaForge Security Alert`,
      attachments: [
        {
          color: color[payload.severity],
          title: payload.title,
          text: payload.message,
          fields: [
            ...(payload.sessionId ? [{
              title: 'Session ID',
              value: payload.sessionId,
              short: true
            }] : []),
            ...(payload.riskScore ? [{
              title: 'Risk Score',
              value: payload.riskScore.toString(),
              short: true
            }] : []),
            ...(payload.businessValue ? [{
              title: 'Business Value',
              value: `$${(payload.businessValue * 1000).toLocaleString()}`,
              short: true
            }] : []),
            {
              title: 'Severity',
              value: payload.severity.toUpperCase(),
              short: true
            }
          ],
          timestamp: Math.floor(Date.now() / 1000)
        }
      ]
    };
    
    try {
      await axios.post(this.slackWebhook, slackMessage);
      console.log('✅ Slack alert sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Slack alert:', error);
    }
  }
  
  // Discord webhook notifications (FREE)
  private async sendDiscordAlert(payload: NotificationPayload): Promise<void> {
    if (!this.discordWebhook) return;
    
    const severityColor = {
      low: 0x36a64f,
      medium: 0xffcc00,
      high: 0xff6600,
      critical: 0xff0000
    };
    
    const discordMessage = {
      embeds: [
        {
          title: payload.title,
          description: payload.message,
          color: severityColor[payload.severity],
          timestamp: new Date().toISOString(),
          fields: [
            ...(payload.sessionId ? [{
              name: 'Session ID',
              value: payload.sessionId,
              inline: true
            }] : []),
            ...(payload.riskScore ? [{
              name: 'Risk Score',
              value: payload.riskScore.toString(),
              inline: true
            }] : []),
            ...(payload.businessValue ? [{
              name: 'Business Value',
              value: `$${(payload.businessValue * 1000).toLocaleString()}`,
              inline: true
            }] : []),
            {
              name: 'Severity',
              value: payload.severity.toUpperCase(),
              inline: true
            }
          ],
          footer: {
            text: 'AlphaForge Security System'
          }
        }
      ]
    };
    
    try {
      await axios.post(this.discordWebhook, discordMessage);
      console.log('✅ Discord alert sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Discord alert:', error);
    }
  }
  
  // Email notifications using SMTP (FREE with Gmail/Outlook)
  private async sendEmailAlert(payload: NotificationPayload): Promise<void> {
    if (!this.emailConfig.enabled) return;
    
    // Using nodemailer would require additional dependency
    // For now, implementing basic SMTP with node's built-in modules
    const nodemailer = await import('nodemailer').catch(() => null);
    if (!nodemailer) {
      console.log('📧 Nodemailer not available - install for email alerts');
      return;
    }
    
    const transporter = nodemailer.createTransporter({
      host: this.emailConfig.host,
      port: this.emailConfig.port,
      secure: this.emailConfig.port === 465,
      auth: {
        user: this.emailConfig.user,
        pass: this.emailConfig.pass
      }
    });
    
    const emailHTML = this.generateEmailHTML(payload);
    
    const mailOptions = {
      from: this.emailConfig.from,
      to: process.env.ALERT_EMAIL || 'admin@alpha-forge.io',
      subject: `[${payload.severity.toUpperCase()}] AlphaForge Alert: ${payload.title}`,
      html: emailHTML,
      text: payload.message
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email alert sent successfully');
    } catch (error) {
      console.error('❌ Failed to send email alert:', error);
    }
  }
  
  // Console alerts (always available)
  private sendConsoleAlert(payload: NotificationPayload): void {
    const severityEmoji = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🚨'
    };
    
    console.log(`${severityEmoji[payload.severity]} ALERT [${payload.severity.toUpperCase()}]: ${payload.title}`);
    console.log(`Message: ${payload.message}`);
    if (payload.sessionId) console.log(`Session: ${payload.sessionId}`);
    if (payload.riskScore) console.log(`Risk Score: ${payload.riskScore}`);
    if (payload.businessValue) console.log(`Business Value: $${(payload.businessValue * 1000).toLocaleString()}`);
  }
  
  // Specialized alerts for different threat types
  public async sendHedgeFundAlert(data: {
    traderType: string;
    riskScore: number;
    businessValue: number;
    sessionId: string;
    indicators: string[];
    estimatedRevenue: number;
  }): Promise<void> {
    await this.sendAlert({
      title: `🎯 Hedge Fund Detection: ${data.traderType.toUpperCase()}`,
      message: `High-value institutional trader detected with ${data.indicators.length} suspicious indicators. ` +
               `Estimated revenue opportunity: $${data.estimatedRevenue.toLocaleString()}. ` +
               `Indicators: ${data.indicators.join(', ')}`,
      severity: 'critical',
      sessionId: data.sessionId,
      riskScore: data.riskScore,
      businessValue: data.businessValue,
      metadata: {
        traderType: data.traderType,
        indicators: data.indicators,
        estimatedRevenue: data.estimatedRevenue
      }
    });
  }
  
  public async sendCompetitorAlert(data: {
    competitorType: string;
    riskScore: number;
    sessionId: string;
    indicators: string[];
    threat: string;
  }): Promise<void> {
    await this.sendAlert({
      title: `🕵️ Competitor Detection: ${data.competitorType}`,
      message: `Potential competitor reconnaissance detected. Threat: ${data.threat}. ` +
               `Indicators: ${data.indicators.join(', ')}`,
      severity: 'high',
      sessionId: data.sessionId,
      riskScore: data.riskScore,
      metadata: {
        competitorType: data.competitorType,
        indicators: data.indicators,
        threat: data.threat
      }
    });
  }
  
  public async sendBusinessProspectAlert(data: {
    prospectType: string;
    businessValue: number;
    estimatedRevenue: number;
    sessionId: string;
    contactRoute: string;
  }): Promise<void> {
    await this.sendAlert({
      title: `💰 Business Prospect: ${data.prospectType}`,
      message: `High-value business prospect identified. Route to: ${data.contactRoute}. ` +
               `Estimated revenue: $${data.estimatedRevenue.toLocaleString()}`,
      severity: 'medium',
      sessionId: data.sessionId,
      businessValue: data.businessValue,
      metadata: {
        prospectType: data.prospectType,
        estimatedRevenue: data.estimatedRevenue,
        contactRoute: data.contactRoute
      }
    });
  }
  
  // Generate HTML email template
  private generateEmailHTML(payload: NotificationPayload): string {
    const severityColor = {
      low: '#36a64f',
      medium: '#ffcc00',
      high: '#ff6600',
      critical: '#ff0000'
    };
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>AlphaForge Security Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="background-color: ${severityColor[payload.severity]}; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">AlphaForge Security Alert</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Severity: ${payload.severity.toUpperCase()}</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">${payload.title}</h2>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">${payload.message}</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Event Details</h3>
              ${payload.sessionId ? `<p><strong>Session ID:</strong> ${payload.sessionId}</p>` : ''}
              ${payload.riskScore ? `<p><strong>Risk Score:</strong> ${payload.riskScore}/200</p>` : ''}
              ${payload.businessValue ? `<p><strong>Business Value:</strong> $${(payload.businessValue * 1000).toLocaleString()}</p>` : ''}
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 14px;">
                This is an automated alert from the AlphaForge Security System
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const freeNotificationSystem = new FreeNotificationSystem();