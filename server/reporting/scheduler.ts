/*
 * AlphaForge - Automated Reporting Scheduler
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Automated daily/weekly report generation with cron-like scheduling.
 * Unauthorized access, copying, or distribution is strictly prohibited.
 */

import { complianceReportingSystem } from './complianceReporting';
import { advancedWebhookServices } from '../alerting/webhookServices';
import { enhancedLogger } from '../alerting/logger';

export class AutomatedReportingScheduler {
  private dailyInterval: NodeJS.Timeout | null = null;
  private weeklyInterval: NodeJS.Timeout | null = null;
  private archivalInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.initializeScheduler();
  }
  
  private initializeScheduler(): void {
    console.log('📅 Automated reporting scheduler initialized');
    
    // Schedule daily reports at 6 AM
    this.scheduleDailyReports();
    
    // Schedule weekly reports on Mondays at 8 AM
    this.scheduleWeeklyReports();
    
    // Schedule log archival on first day of month at 2 AM
    this.scheduleLogArchival();
    
    console.log('📅 All report schedules configured:');
    console.log('   - Daily reports: 6:00 AM');
    console.log('   - Weekly reports: Monday 8:00 AM');
    console.log('   - Log archival: 1st of month 2:00 AM');
  }
  
  private scheduleDailyReports(): void {
    // Calculate time until next 6 AM
    const now = new Date();
    const next6AM = new Date();
    next6AM.setHours(6, 0, 0, 0);
    
    if (next6AM <= now) {
      next6AM.setDate(next6AM.getDate() + 1);
    }
    
    const timeUntilNext6AM = next6AM.getTime() - now.getTime();
    
    setTimeout(() => {
      // Generate first daily report
      this.executeDailyReporting();
      
      // Then schedule daily recurring reports (every 24 hours)
      this.dailyInterval = setInterval(() => {
        this.executeDailyReporting();
      }, 24 * 60 * 60 * 1000);
      
    }, timeUntilNext6AM);
    
    console.log(`📅 Daily reports scheduled - next report in ${Math.round(timeUntilNext6AM / (1000 * 60 * 60))} hours`);
  }
  
  private scheduleWeeklyReports(): void {
    // Calculate time until next Monday 8 AM
    const now = new Date();
    const nextMonday8AM = new Date();
    
    // Set to Monday 8 AM
    const daysUntilMonday = (1 + 7 - now.getDay()) % 7 || 7;
    nextMonday8AM.setDate(now.getDate() + daysUntilMonday);
    nextMonday8AM.setHours(8, 0, 0, 0);
    
    if (nextMonday8AM <= now) {
      nextMonday8AM.setDate(nextMonday8AM.getDate() + 7);
    }
    
    const timeUntilNextMonday8AM = nextMonday8AM.getTime() - now.getTime();
    
    setTimeout(() => {
      // Generate first weekly report
      this.executeWeeklyReporting();
      
      // Then schedule weekly recurring reports (every 7 days)
      this.weeklyInterval = setInterval(() => {
        this.executeWeeklyReporting();
      }, 7 * 24 * 60 * 60 * 1000);
      
    }, timeUntilNextMonday8AM);
    
    console.log(`📅 Weekly reports scheduled - next report in ${Math.round(timeUntilNextMonday8AM / (1000 * 60 * 60))} hours`);
  }
  
  private scheduleLogArchival(): void {
    // Calculate time until first day of next month 2 AM
    const now = new Date();
    const nextMonth2AM = new Date(now.getFullYear(), now.getMonth() + 1, 1, 2, 0, 0, 0);
    
    const timeUntilNextMonth2AM = nextMonth2AM.getTime() - now.getTime();
    
    setTimeout(() => {
      // Execute first archival
      this.executeLogArchival();
      
      // Then schedule monthly recurring archival
      this.archivalInterval = setInterval(() => {
        this.executeLogArchival();
      }, 30 * 24 * 60 * 60 * 1000); // Approximately monthly
      
    }, timeUntilNextMonth2AM);
    
    console.log(`📅 Log archival scheduled - next archival in ${Math.round(timeUntilNextMonth2AM / (1000 * 60 * 60 * 24))} days`);
  }
  
  // Execute daily reporting workflow
  private async executeDailyReporting(): Promise<void> {
    console.log('📅 Executing daily compliance reporting...');
    
    try {
      // Generate comprehensive daily report
      await complianceReportingSystem.generateDailyComplianceReport();
      
      // Send daily summary alert
      await this.sendDailySummaryAlert();
      
      // Log successful execution
      await enhancedLogger.logEvent('daily_report_generated', {
        timestamp: new Date().toISOString(),
        status: 'success',
        reportType: 'daily_compliance'
      }, {
        severity: 'low',
        businessValue: 50
      });
      
      console.log('✅ Daily compliance reporting completed successfully');
      
    } catch (error) {
      console.error('❌ Daily reporting failed:', error);
      
      // Log failure and send alert
      await enhancedLogger.logEvent('daily_report_failed', {
        timestamp: new Date().toISOString(),
        error: error.message,
        reportType: 'daily_compliance'
      }, {
        severity: 'high'
      });
      
      // Send failure notification
      await advancedWebhookServices.sendAdvancedAlert({
        title: '🚨 Daily Report Generation Failed',
        message: `Daily compliance report failed to generate. Error: ${error.message}. Manual intervention required.`,
        severity: 'critical',
        metadata: { error: error.message, timestamp: new Date().toISOString() }
      });
    }
  }
  
  // Execute weekly reporting workflow
  private async executeWeeklyReporting(): Promise<void> {
    console.log('📅 Executing weekly compliance reporting...');
    
    try {
      // Generate comprehensive weekly report
      await complianceReportingSystem.generateWeeklyComplianceReport();
      
      // Send weekly summary alert
      await this.sendWeeklySummaryAlert();
      
      // Log successful execution
      await enhancedLogger.logEvent('weekly_report_generated', {
        timestamp: new Date().toISOString(),
        status: 'success',
        reportType: 'weekly_compliance'
      }, {
        severity: 'medium',
        businessValue: 100
      });
      
      console.log('✅ Weekly compliance reporting completed successfully');
      
    } catch (error) {
      console.error('❌ Weekly reporting failed:', error);
      
      // Log failure and send critical alert
      await enhancedLogger.logEvent('weekly_report_failed', {
        timestamp: new Date().toISOString(),
        error: error.message,
        reportType: 'weekly_compliance'
      }, {
        severity: 'critical'
      });
      
      // Send failure notification to all channels
      await advancedWebhookServices.sendAdvancedAlert({
        title: '🚨 CRITICAL: Weekly Report Generation Failed',
        message: `Weekly compliance report failed to generate. This impacts board reporting. Error: ${error.message}. Immediate attention required.`,
        severity: 'critical',
        metadata: { error: error.message, timestamp: new Date().toISOString(), impact: 'board_reporting' }
      });
    }
  }
  
  // Execute log archival workflow
  private async executeLogArchival(): Promise<void> {
    console.log('📅 Executing automated log archival...');
    
    try {
      // Rotate and archive old logs
      await complianceReportingSystem.rotateAndArchiveLogs();
      
      // Log successful execution
      await enhancedLogger.logEvent('log_archival_completed', {
        timestamp: new Date().toISOString(),
        status: 'success',
        archivalType: 'monthly_rotation'
      }, {
        severity: 'low'
      });
      
      console.log('✅ Automated log archival completed successfully');
      
    } catch (error) {
      console.error('❌ Log archival failed:', error);
      
      // Log failure
      await enhancedLogger.logEvent('log_archival_failed', {
        timestamp: new Date().toISOString(),
        error: error.message,
        archivalType: 'monthly_rotation'
      }, {
        severity: 'medium'
      });
      
      // Send notification
      await advancedWebhookServices.sendAdvancedAlert({
        title: '⚠️ Log Archival Failed',
        message: `Monthly log archival failed. This may impact compliance. Error: ${error.message}. Review and manual archival recommended.`,
        severity: 'medium',
        metadata: { error: error.message, timestamp: new Date().toISOString() }
      });
    }
  }
  
  // Send daily summary alert
  private async sendDailySummaryAlert(): Promise<void> {
    try {
      // Get basic metrics for summary
      const recentEvents = await enhancedLogger.getRecentEvents(100);
      const todayEvents = recentEvents.filter(event => 
        event.timestamp.startsWith(new Date().toISOString().split('T')[0])
      );
      
      const summary = {
        totalThreats: todayEvents.length,
        totalProspects: todayEvents.filter(e => e.businessValue && e.businessValue > 100).length,
        estimatedRevenue: todayEvents.reduce((sum, e) => sum + ((e.businessValue || 0) * 1000), 0),
        criticalIncidents: todayEvents.filter(e => e.severity === 'critical').length,
        topThreat: todayEvents.length > 0 ? 'Institutional analysis' : 'No significant threats'
      };
      
      await advancedWebhookServices.sendDailySummaryAlert(summary);
      
    } catch (error) {
      console.error('Failed to send daily summary alert:', error);
    }
  }
  
  // Send weekly summary alert
  private async sendWeeklySummaryAlert(): Promise<void> {
    try {
      // Get weekly metrics for summary
      const recentEvents = await enhancedLogger.getRecentEvents(1000);
      const weekEvents = recentEvents.filter(event => {
        const eventDate = new Date(event.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return eventDate >= weekAgo;
      });
      
      const summary = {
        totalThreats: weekEvents.length,
        totalProspects: weekEvents.filter(e => e.businessValue && e.businessValue > 100).length,
        estimatedRevenue: weekEvents.reduce((sum, e) => sum + ((e.businessValue || 0) * 1000), 0),
        criticalIncidents: weekEvents.filter(e => e.severity === 'critical').length,
        topThreat: weekEvents.length > 0 ? 'Hedge fund reconnaissance' : 'No significant threats'
      };
      
      // Send enhanced weekly summary
      await advancedWebhookServices.sendAdvancedAlert({
        title: '📊 Weekly Executive Summary - AlphaForge Intelligence',
        message: `Weekly performance: ${summary.totalThreats} threats analyzed, ${summary.totalProspects} prospects identified worth $${summary.estimatedRevenue.toLocaleString()}. ${summary.criticalIncidents} critical incidents managed. System performance excellent.`,
        severity: 'medium',
        metadata: { ...summary, reportType: 'weekly_summary' }
      });
      
    } catch (error) {
      console.error('Failed to send weekly summary alert:', error);
    }
  }
  
  // Manual report generation methods
  public async generateManualDailyReport(): Promise<void> {
    console.log('📅 Manual daily report generation requested...');
    await this.executeDailyReporting();
  }
  
  public async generateManualWeeklyReport(): Promise<void> {
    console.log('📅 Manual weekly report generation requested...');
    await this.executeWeeklyReporting();
  }
  
  public async executeManualArchival(): Promise<void> {
    console.log('📅 Manual log archival requested...');
    await this.executeLogArchival();
  }
  
  // Shutdown method to clean up intervals
  public shutdown(): void {
    if (this.dailyInterval) {
      clearInterval(this.dailyInterval);
      this.dailyInterval = null;
    }
    
    if (this.weeklyInterval) {
      clearInterval(this.weeklyInterval);
      this.weeklyInterval = null;
    }
    
    if (this.archivalInterval) {
      clearInterval(this.archivalInterval);
      this.archivalInterval = null;
    }
    
    console.log('📅 Automated reporting scheduler shutdown complete');
  }
  
  // Status check method
  public getSchedulerStatus(): any {
    return {
      dailyReportsActive: !!this.dailyInterval,
      weeklyReportsActive: !!this.weeklyInterval,
      archivalActive: !!this.archivalInterval,
      nextDailyReport: 'Next 6:00 AM',
      nextWeeklyReport: 'Next Monday 8:00 AM',
      nextArchival: '1st of next month 2:00 AM'
    };
  }
}

export const automatedReportingScheduler = new AutomatedReportingScheduler();