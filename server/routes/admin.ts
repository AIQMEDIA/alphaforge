/*
 * AlphaForge - Admin Routes for Compliance and Reporting
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Administrative endpoints for compliance reporting and system monitoring.
 * Unauthorized access, copying, or distribution is strictly prohibited.
 */

import { Router } from 'express';
import { complianceReportingSystem } from '../reporting/complianceReporting';
import { automatedReportingScheduler } from '../reporting/scheduler';
import { enhancedLogger } from '../alerting/logger';
import { businessIntelligenceRouter } from '../alerting/businessIntelligence';
import { advancedWebhookServices } from '../alerting/webhookServices';

const router = Router();

// Generate manual daily compliance report
router.post('/reports/daily', async (req, res) => {
  try {
    await complianceReportingSystem.generateDailyComplianceReport();
    res.json({ 
      success: true, 
      message: 'Daily compliance report generated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Generate manual weekly compliance report
router.post('/reports/weekly', async (req, res) => {
  try {
    await complianceReportingSystem.generateWeeklyComplianceReport();
    res.json({ 
      success: true, 
      message: 'Weekly compliance report generated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get reporting scheduler status
router.get('/reports/scheduler/status', (req, res) => {
  try {
    const status = automatedReportingScheduler.getSchedulerStatus();
    res.json({
      success: true,
      scheduler: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Execute manual log archival
router.post('/logs/archive', async (req, res) => {
  try {
    await automatedReportingScheduler.executeManualArchival();
    res.json({
      success: true,
      message: 'Log archival completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get threat intelligence summary
router.get('/intelligence/threats', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const threatReport = await enhancedLogger.getThreatIntelligenceReport(days);
    res.json({
      success: true,
      threats: threatReport,
      period: `${days} days`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get business intelligence summary
router.get('/intelligence/business', async (req, res) => {
  try {
    const biReport = await businessIntelligenceRouter.generateBusinessIntelligenceReport();
    res.json({
      success: true,
      businessIntelligence: biReport,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send test alert to all configured channels
router.post('/alerts/test', async (req, res) => {
  try {
    const { severity = 'medium', message = 'Test alert from AlphaForge admin panel' } = req.body;
    
    await advancedWebhookServices.sendAdvancedAlert({
      title: '🧪 Admin Test Alert',
      message,
      severity,
      metadata: { 
        source: 'admin_panel',
        timestamp: new Date().toISOString(),
        testType: 'manual'
      }
    });
    
    res.json({
      success: true,
      message: 'Test alert sent to all configured channels',
      severity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get recent events with pagination
router.get('/events', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const events = await enhancedLogger.getRecentEvents(limit);
    
    res.json({
      success: true,
      events,
      count: events.length,
      limit,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Export security events as CSV
router.get('/export/security', async (req, res) => {
  try {
    const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
    const toDate = req.query.to ? new Date(req.query.to as string) : undefined;
    
    await enhancedLogger.exportSecurityEventsCSV(fromDate, toDate);
    
    res.json({
      success: true,
      message: 'Security events exported to CSV successfully',
      period: {
        from: fromDate?.toISOString(),
        to: toDate?.toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// System health endpoint
router.get('/health', async (req, res) => {
  try {
    const recentEvents = await enhancedLogger.getRecentEvents(10);
    const biReport = await businessIntelligenceRouter.generateBusinessIntelligenceReport();
    const schedulerStatus = automatedReportingScheduler.getSchedulerStatus();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      recentActivity: {
        eventCount: recentEvents.length,
        lastEventTime: recentEvents[0]?.timestamp || 'No recent events'
      },
      businessIntelligence: {
        totalProspects: biReport?.totalProspects || 0,
        estimatedRevenue: biReport?.estimatedTotalRevenue || 0
      },
      scheduler: schedulerStatus,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
    
    res.json({
      success: true,
      health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export { router as adminRoutes };