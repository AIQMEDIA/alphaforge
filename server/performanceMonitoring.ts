// AlphaForge Performance Monitoring System
// Tracks user activity, fraud prevention stats, and growth metrics

import { storage } from './storage.js';

export interface PerformanceMetrics {
  weekStart: Date;
  weekEnd: Date;
  userActivity: {
    totalSessions: number;
    uniqueUsers: number;
    authenticatedUsers: number;
    guestUsers: number;
    averageSessionDuration: number;
    totalMessages: number;
    averageMessagesPerSession: number;
  };
  fraudPrevention: {
    totalAttempts: number;
    blockedAttempts: number;
    blockRate: number;
    highRiskAccounts: number;
    disposableEmails: number;
    aliasedEmails: number;
    rapidCreationAttempts: number;
    botBehaviorDetected: number;
  };
  leadGeneration: {
    totalCRMSubmissions: number;
    conversionRate: number;
    leadsByRole: Record<string, number>;
    leadsByExperience: Record<string, number>;
    topCompanies: string[];
  };
  systemHealth: {
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
    databaseConnections: number;
  };
  growthInsights: {
    weekOverWeekGrowth: number;
    trendsAndPatterns: string[];
    troubleshootingOpportunities: string[];
    recommendations: string[];
  };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async generateWeeklyReport(weekOffset: number = 0): Promise<PerformanceMetrics> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (now.getDay() + 7 * weekOffset));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const metrics: PerformanceMetrics = {
      weekStart,
      weekEnd,
      userActivity: await this.calculateUserActivity(weekStart, weekEnd),
      fraudPrevention: await this.calculateFraudMetrics(weekStart, weekEnd),
      leadGeneration: await this.calculateLeadMetrics(weekStart, weekEnd),
      systemHealth: await this.calculateSystemHealth(weekStart, weekEnd),
      growthInsights: await this.calculateGrowthInsights(weekStart, weekEnd)
    };

    this.metrics.push(metrics);
    return metrics;
  }

  private async calculateUserActivity(start: Date, end: Date) {
    try {
      // Get all chat sessions for the week
      const sessions = await storage.getChatSessionsInDateRange(start, end);
      const conversations = await storage.getChatConversationsInDateRange(start, end);

      const uniqueUsers = new Set(sessions.filter((s: any) => s.userId).map((s: any) => s.userId)).size;
      const authenticatedUsers = sessions.filter((s: any) => s.userId).length;
      const guestUsers = sessions.filter((s: any) => !s.userId).length;

      const totalMessages = conversations.length;
      const averageMessagesPerSession = sessions.length > 0 ? totalMessages / sessions.length : 0;

      return {
        totalSessions: sessions.length,
        uniqueUsers,
        authenticatedUsers,
        guestUsers,
        averageSessionDuration: 0, // Would need session tracking for this
        totalMessages,
        averageMessagesPerSession: Math.round(averageMessagesPerSession * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating user activity:', error);
      return {
        totalSessions: 0,
        uniqueUsers: 0,
        authenticatedUsers: 0,
        guestUsers: 0,
        averageSessionDuration: 0,
        totalMessages: 0,
        averageMessagesPerSession: 0
      };
    }
  }

  private async calculateFraudMetrics(start: Date, end: Date) {
    try {
      const fraudRecords = await storage.getFraudRecordsInDateRange(start, end);

      const totalAttempts = fraudRecords.length;
      const blockedAttempts = fraudRecords.filter(r => r.isBlocked).length;
      const blockRate = totalAttempts > 0 ? (blockedAttempts / totalAttempts) * 100 : 0;
      const highRiskAccounts = fraudRecords.filter(r => r.riskScore >= 70).length;

      // Analyze flagged reasons
      const disposableEmails = fraudRecords.filter((r: any) => 
        r.flaggedReason?.includes('disposable') || r.flaggedReason?.includes('temporary')
      ).length;

      const aliasedEmails = fraudRecords.filter((r: any) => 
        r.flaggedReason?.includes('alias') || r.flaggedReason?.includes('+')
      ).length;

      const rapidCreationAttempts = fraudRecords.filter((r: any) => 
        r.flaggedReason?.includes('rapid') || r.flaggedReason?.includes('multiple')
      ).length;

      const botBehaviorDetected = fraudRecords.filter((r: any) => 
        r.flaggedReason?.includes('bot') || r.flaggedReason?.includes('messaging')
      ).length;

      return {
        totalAttempts,
        blockedAttempts,
        blockRate: Math.round(blockRate * 100) / 100,
        highRiskAccounts,
        disposableEmails,
        aliasedEmails,
        rapidCreationAttempts,
        botBehaviorDetected
      };
    } catch (error) {
      console.error('Error calculating fraud metrics:', error);
      return {
        totalAttempts: 0,
        blockedAttempts: 0,
        blockRate: 0,
        highRiskAccounts: 0,
        disposableEmails: 0,
        aliasedEmails: 0,
        rapidCreationAttempts: 0,
        botBehaviorDetected: 0
      };
    }
  }

  private async calculateLeadMetrics(start: Date, end: Date) {
    try {
      const leads = await storage.getCRMLeadsInDateRange(start, end);
      const sessions = await storage.getChatSessionsInDateRange(start, end);

      const totalCRMSubmissions = leads.length;
      const conversionRate = sessions.length > 0 ? (totalCRMSubmissions / sessions.length) * 100 : 0;

      // Group by role
      const leadsByRole = leads.reduce((acc: any, lead: any) => {
        acc[lead.role] = (acc[lead.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group by experience
      const leadsByExperience = leads.reduce((acc: any, lead: any) => {
        acc[lead.tradingExperience] = (acc[lead.tradingExperience] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Top companies
      const companyCounts = leads.reduce((acc: any, lead: any) => {
        if (lead.company) {
          acc[lead.company] = (acc[lead.company] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topCompanies = Object.entries(companyCounts)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([company]) => company);

      return {
        totalCRMSubmissions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        leadsByRole,
        leadsByExperience,
        topCompanies
      };
    } catch (error) {
      console.error('Error calculating lead metrics:', error);
      return {
        totalCRMSubmissions: 0,
        conversionRate: 0,
        leadsByRole: {},
        leadsByExperience: {},
        topCompanies: []
      };
    }
  }

  private async calculateSystemHealth(start: Date, end: Date) {
    // Placeholder for system health metrics
    // In a production system, this would integrate with monitoring tools
    return {
      averageResponseTime: 250, // ms
      errorRate: 0.1, // %
      uptime: 99.9, // %
      databaseConnections: 5
    };
  }

  private async calculateGrowthInsights(start: Date, end: Date): Promise<{
    weekOverWeekGrowth: number;
    trendsAndPatterns: string[];
    troubleshootingOpportunities: string[];
    recommendations: string[];
  }> {
    const currentWeekMetrics = await this.calculateUserActivity(start, end);
    const previousWeek = new Date(start);
    previousWeek.setDate(start.getDate() - 7);
    const previousWeekEnd = new Date(end);
    previousWeekEnd.setDate(end.getDate() - 7);
    
    const previousWeekMetrics = await this.calculateUserActivity(previousWeek, previousWeekEnd);
    
    const weekOverWeekGrowth = previousWeekMetrics.totalSessions > 0 
      ? ((currentWeekMetrics.totalSessions - previousWeekMetrics.totalSessions) / previousWeekMetrics.totalSessions) * 100
      : 0;

    const trendsAndPatterns: string[] = [];
    const troubleshootingOpportunities: string[] = [];
    const recommendations: string[] = [];

    // Analyze trends
    if (weekOverWeekGrowth > 20) {
      trendsAndPatterns.push('Significant growth in user engagement this week');
    } else if (weekOverWeekGrowth < -10) {
      trendsAndPatterns.push('Decline in user activity - needs investigation');
      troubleshootingOpportunities.push('Investigate cause of user activity decline');
    }

    if (currentWeekMetrics.averageMessagesPerSession > 5) {
      trendsAndPatterns.push('High user engagement - users are asking many questions');
    } else if (currentWeekMetrics.averageMessagesPerSession < 2) {
      troubleshootingOpportunities.push('Low message engagement - users may not be finding value');
    }

    // Generate recommendations
    if (currentWeekMetrics.guestUsers > currentWeekMetrics.authenticatedUsers) {
      recommendations.push('Consider improving auth conversion - many users remain guests');
    }

    if (currentWeekMetrics.totalSessions > 0 && currentWeekMetrics.uniqueUsers / currentWeekMetrics.totalSessions < 0.5) {
      recommendations.push('Good user retention - users are returning for multiple sessions');
    }

    return {
      weekOverWeekGrowth: Math.round(weekOverWeekGrowth * 100) / 100,
      trendsAndPatterns,
      troubleshootingOpportunities,
      recommendations
    };
  }

  generateEmailReport(metrics: PerformanceMetrics): string {
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
      month: 'long', day: 'numeric', year: 'numeric' 
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
    .section { margin: 20px 0; padding: 15px; border-left: 4px solid #667eea; background: #f8f9fa; }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .metric-value { font-size: 24px; font-weight: bold; color: #667eea; }
    .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .positive { color: #28a745; }
    .negative { color: #dc3545; }
    .warning { color: #ffc107; }
    .list-item { margin: 5px 0; padding-left: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 AlphaForge Weekly Performance Report</h1>
    <p>${formatDate(metrics.weekStart)} - ${formatDate(metrics.weekEnd)}</p>
  </div>

  <div class="section">
    <h2>👥 User Activity</h2>
    <div class="metric">
      <div class="metric-value">${metrics.userActivity.totalSessions}</div>
      <div class="metric-label">Total Sessions</div>
    </div>
    <div class="metric">
      <div class="metric-value">${metrics.userActivity.uniqueUsers}</div>
      <div class="metric-label">Unique Users</div>
    </div>
    <div class="metric">
      <div class="metric-value">${metrics.userActivity.totalMessages}</div>
      <div class="metric-label">Messages Sent</div>
    </div>
    <div class="metric">
      <div class="metric-value">${metrics.userActivity.averageMessagesPerSession}</div>
      <div class="metric-label">Avg Messages/Session</div>
    </div>
  </div>

  <div class="section">
    <h2>🛡️ Fraud Prevention</h2>
    <div class="metric">
      <div class="metric-value">${metrics.fraudPrevention.totalAttempts}</div>
      <div class="metric-label">Total Attempts</div>
    </div>
    <div class="metric">
      <div class="metric-value ${metrics.fraudPrevention.blockedAttempts > 0 ? 'positive' : ''}">${metrics.fraudPrevention.blockedAttempts}</div>
      <div class="metric-label">Blocked Attempts</div>
    </div>
    <div class="metric">
      <div class="metric-value">${metrics.fraudPrevention.blockRate}%</div>
      <div class="metric-label">Block Rate</div>
    </div>
    <p><strong>Fraud Types Detected:</strong></p>
    <ul>
      <li>Disposable Emails: ${metrics.fraudPrevention.disposableEmails}</li>
      <li>Email Aliases: ${metrics.fraudPrevention.aliasedEmails}</li>
      <li>Rapid Creation: ${metrics.fraudPrevention.rapidCreationAttempts}</li>
      <li>Bot Behavior: ${metrics.fraudPrevention.botBehaviorDetected}</li>
    </ul>
  </div>

  <div class="section">
    <h2>🎯 Lead Generation</h2>
    <div class="metric">
      <div class="metric-value">${metrics.leadGeneration.totalCRMSubmissions}</div>
      <div class="metric-label">CRM Submissions</div>
    </div>
    <div class="metric">
      <div class="metric-value">${metrics.leadGeneration.conversionRate}%</div>
      <div class="metric-label">Conversion Rate</div>
    </div>
    ${Object.keys(metrics.leadGeneration.leadsByRole).length > 0 ? `
    <p><strong>Leads by Role:</strong></p>
    <ul>
      ${Object.entries(metrics.leadGeneration.leadsByRole).map(([role, count]) => 
        `<li>${role}: ${count}</li>`
      ).join('')}
    </ul>
    ` : ''}
  </div>

  <div class="section">
    <h2>📈 Growth Insights</h2>
    <div class="metric">
      <div class="metric-value ${metrics.growthInsights.weekOverWeekGrowth > 0 ? 'positive' : 'negative'}">${metrics.growthInsights.weekOverWeekGrowth > 0 ? '+' : ''}${metrics.growthInsights.weekOverWeekGrowth}%</div>
      <div class="metric-label">Week-over-Week Growth</div>
    </div>
    
    ${metrics.growthInsights.trendsAndPatterns.length > 0 ? `
    <p><strong>🔍 Trends & Patterns:</strong></p>
    <ul>
      ${metrics.growthInsights.trendsAndPatterns.map(trend => `<li class="list-item">${trend}</li>`).join('')}
    </ul>
    ` : ''}

    ${metrics.growthInsights.troubleshootingOpportunities.length > 0 ? `
    <p><strong>🔧 Troubleshooting Opportunities:</strong></p>
    <ul>
      ${metrics.growthInsights.troubleshootingOpportunities.map(item => `<li class="list-item warning">${item}</li>`).join('')}
    </ul>
    ` : ''}

    ${metrics.growthInsights.recommendations.length > 0 ? `
    <p><strong>💡 Recommendations:</strong></p>
    <ul>
      ${metrics.growthInsights.recommendations.map(rec => `<li class="list-item">${rec}</li>`).join('')}
    </ul>
    ` : ''}
  </div>

  <div class="section">
    <h2>⚡ System Health</h2>
    <div class="metric">
      <div class="metric-value">${metrics.systemHealth.averageResponseTime}ms</div>
      <div class="metric-label">Avg Response Time</div>
    </div>
    <div class="metric">
      <div class="metric-value">${metrics.systemHealth.uptime}%</div>
      <div class="metric-label">Uptime</div>
    </div>
    <div class="metric">
      <div class="metric-value ${metrics.systemHealth.errorRate < 1 ? 'positive' : 'warning'}">${metrics.systemHealth.errorRate}%</div>
      <div class="metric-label">Error Rate</div>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>AlphaForge Performance Monitoring System</p>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
    `;
  }

  async saveReportToFile(metrics: PerformanceMetrics): Promise<string> {
    const filename = `performance-report-${metrics.weekStart.toISOString().split('T')[0]}.html`;
    const reportContent = this.generateEmailReport(metrics);
    
    // In a real system, you'd save this to a file or database
    console.log(`Performance report generated: ${filename}`);
    return filename;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();