/*
 * AlphaForge - Advanced Webhook Services
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Microsoft Teams, WhatsApp Business, Signal webhook integrations for enterprise alerting.
 * Unauthorized access, copying, or distribution is strictly prohibited.
 */

import axios from 'axios';

interface WebhookAlert {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sessionId?: string;
  riskScore?: number;
  businessValue?: number;
  metadata?: any;
}

export class AdvancedWebhookServices {
  private teamsWebhook: string | undefined;
  private whatsappConfig: any;
  private signalConfig: any;
  
  constructor() {
    this.teamsWebhook = process.env.TEAMS_WEBHOOK_URL;
    this.whatsappConfig = {
      enabled: !!process.env.WHATSAPP_ACCESS_TOKEN,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      recipientNumber: process.env.WHATSAPP_RECIPIENT_NUMBER
    };
    this.signalConfig = {
      enabled: !!process.env.SIGNAL_CLI_REST_API,
      apiUrl: process.env.SIGNAL_CLI_REST_API || 'http://localhost:8080',
      sender: process.env.SIGNAL_SENDER_NUMBER,
      recipients: (process.env.SIGNAL_RECIPIENTS || '').split(',').filter(n => n.trim())
    };
    
    this.logConfiguration();
  }
  
  private logConfiguration(): void {
    console.log('🔗 Advanced Webhook Services initialized:', {
      teams: !!this.teamsWebhook,
      whatsapp: this.whatsappConfig.enabled,
      signal: this.signalConfig.enabled
    });
  }
  
  // Main webhook dispatcher
  public async sendAdvancedAlert(alert: WebhookAlert): Promise<void> {
    const promises: Promise<void>[] = [];
    
    // Critical and high alerts go to all channels
    if (alert.severity === 'critical' || alert.severity === 'high') {
      if (this.teamsWebhook) promises.push(this.sendTeamsAlert(alert));
      if (this.whatsappConfig.enabled) promises.push(this.sendWhatsAppAlert(alert));
      if (this.signalConfig.enabled) promises.push(this.sendSignalAlert(alert));
    } else {
      // Medium and low alerts - Teams only
      if (this.teamsWebhook) promises.push(this.sendTeamsAlert(alert));
    }
    
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error sending advanced webhook alerts:', error);
    }
  }
  
  // Microsoft Teams webhook integration (FREE)
  private async sendTeamsAlert(alert: WebhookAlert): Promise<void> {
    if (!this.teamsWebhook) return;
    
    const severityColor = {
      low: '0078d4',      // Blue
      medium: 'ffaa44',   // Orange
      high: 'ff4444',     // Red
      critical: 'cc0000'  // Dark Red
    };
    
    const teamsCard = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": severityColor[alert.severity],
      "summary": `AlphaForge Alert: ${alert.title}`,
      "sections": [
        {
          "activityTitle": "🛡️ AlphaForge Security Alert",
          "activitySubtitle": `Severity: ${alert.severity.toUpperCase()}`,
          "facts": [
            {
              "name": "Alert Type",
              "value": alert.title
            },
            {
              "name": "Message",
              "value": alert.message
            },
            ...(alert.sessionId ? [{
              "name": "Session ID",
              "value": alert.sessionId
            }] : []),
            ...(alert.riskScore ? [{
              "name": "Risk Score",
              "value": `${alert.riskScore}/200`
            }] : []),
            ...(alert.businessValue ? [{
              "name": "Business Value",
              "value": `$${(alert.businessValue * 1000).toLocaleString()}`
            }] : []),
            {
              "name": "Timestamp",
              "value": new Date().toLocaleString()
            }
          ],
          "markdown": true
        }
      ],
      "potentialAction": [
        {
          "@type": "OpenUri",
          "name": "View Dashboard",
          "targets": [
            {
              "os": "default",
              "uri": "https://alpha-forge.io/admin/security"
            }
          ]
        }
      ]
    };
    
    try {
      await axios.post(this.teamsWebhook, teamsCard);
      console.log('✅ Microsoft Teams alert sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Teams alert:', error);
    }
  }
  
  // WhatsApp Business API integration (FREE tier available)
  private async sendWhatsAppAlert(alert: WebhookAlert): Promise<void> {
    if (!this.whatsappConfig.enabled) return;
    
    const severityEmoji = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🚨'
    };
    
    const whatsappMessage = {
      messaging_product: "whatsapp",
      to: this.whatsappConfig.recipientNumber,
      type: "text",
      text: {
        body: `${severityEmoji[alert.severity]} *AlphaForge Security Alert*\n\n` +
              `*${alert.title}*\n\n` +
              `${alert.message}\n\n` +
              `*Severity:* ${alert.severity.toUpperCase()}\n` +
              `${alert.sessionId ? `*Session:* ${alert.sessionId}\n` : ''}` +
              `${alert.riskScore ? `*Risk Score:* ${alert.riskScore}/200\n` : ''}` +
              `${alert.businessValue ? `*Business Value:* $${(alert.businessValue * 1000).toLocaleString()}\n` : ''}` +
              `*Time:* ${new Date().toLocaleString()}\n\n` +
              `View dashboard: https://alpha-forge.io/admin/security`
      }
    };
    
    try {
      await axios.post(
        `https://graph.facebook.com/v18.0/${this.whatsappConfig.phoneNumberId}/messages`,
        whatsappMessage,
        {
          headers: {
            'Authorization': `Bearer ${this.whatsappConfig.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ WhatsApp alert sent successfully');
    } catch (error) {
      console.error('❌ Failed to send WhatsApp alert:', error);
    }
  }
  
  // Signal messenger integration via signal-cli REST API (FREE)
  private async sendSignalAlert(alert: WebhookAlert): Promise<void> {
    if (!this.signalConfig.enabled || this.signalConfig.recipients.length === 0) return;
    
    const severityEmoji = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🚨'
    };
    
    const signalMessage = `${severityEmoji[alert.severity]} AlphaForge Security Alert\n\n` +
                         `${alert.title}\n\n` +
                         `${alert.message}\n\n` +
                         `Severity: ${alert.severity.toUpperCase()}\n` +
                         `${alert.sessionId ? `Session: ${alert.sessionId}\n` : ''}` +
                         `${alert.riskScore ? `Risk Score: ${alert.riskScore}/200\n` : ''}` +
                         `${alert.businessValue ? `Business Value: $${(alert.businessValue * 1000).toLocaleString()}\n` : ''}` +
                         `Time: ${new Date().toLocaleString()}`;
    
    try {
      for (const recipient of this.signalConfig.recipients) {
        const payload = {
          message: signalMessage,
          number: this.signalConfig.sender,
          recipients: [recipient.trim()]
        };
        
        await axios.post(`${this.signalConfig.apiUrl}/v2/send`, payload);
      }
      console.log('✅ Signal alerts sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Signal alerts:', error);
    }
  }
  
  // Specialized hedge fund alert for all channels
  public async sendHedgeFundCriticalAlert(data: {
    traderType: string;
    riskScore: number;
    businessValue: number;
    sessionId: string;
    indicators: string[];
    estimatedRevenue: number;
  }): Promise<void> {
    await this.sendAdvancedAlert({
      title: `🎯 CRITICAL: Hedge Fund Detection - ${data.traderType.toUpperCase()}`,
      message: `Major institutional trader detected! Revenue opportunity: $${data.estimatedRevenue.toLocaleString()}. ` +
               `Indicators: ${data.indicators.join(', ')}. Immediate executive attention required.`,
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
  
  // Executive escalation for high-value prospects
  public async sendExecutiveEscalation(data: {
    prospectType: string;
    estimatedRevenue: number;
    businessValue: number;
    sessionId: string;
    priority: string;
  }): Promise<void> {
    await this.sendAdvancedAlert({
      title: `🚨 EXECUTIVE ESCALATION: ${data.prospectType.toUpperCase()} Prospect`,
      message: `Critical business opportunity requiring immediate C-level attention. ` +
               `Estimated revenue: $${data.estimatedRevenue.toLocaleString()}. ` +
               `Priority: ${data.priority.toUpperCase()}. Board notification recommended.`,
      severity: 'critical',
      sessionId: data.sessionId,
      businessValue: data.businessValue,
      metadata: {
        prospectType: data.prospectType,
        estimatedRevenue: data.estimatedRevenue,
        priority: data.priority
      }
    });
  }
  
  // Daily summary notification
  public async sendDailySummaryAlert(summary: {
    totalThreats: number;
    totalProspects: number;
    estimatedRevenue: number;
    criticalIncidents: number;
    topThreat: string;
  }): Promise<void> {
    await this.sendAdvancedAlert({
      title: `📊 Daily Security & Business Intelligence Summary`,
      message: `Threats detected: ${summary.totalThreats}, Prospects identified: ${summary.totalProspects}, ` +
               `Total revenue potential: $${summary.estimatedRevenue.toLocaleString()}, ` +
               `Critical incidents: ${summary.criticalIncidents}. Top threat: ${summary.topThreat}.`,
      severity: 'medium',
      metadata: summary
    });
  }
}

export const advancedWebhookServices = new AdvancedWebhookServices();