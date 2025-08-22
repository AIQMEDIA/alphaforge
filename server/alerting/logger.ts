/*
 * AlphaForge - Enhanced Logging System
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Comprehensive logging infrastructure with SQLite, JSON, and CSV output formats.
 * Unauthorized access, copying, or distribution is strictly prohibited.
 */

import sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';
import path from 'path';

interface LogEvent {
  timestamp: string;
  eventType: string;
  details: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  sessionId?: string;
  userId?: string;
  riskScore?: number;
  businessValue?: number;
}

export class EnhancedLogger {
  private db!: sqlite3.Database;
  private logDir: string;
  
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.initializeDatabase();
    this.ensureLogDirectory();
  }
  
  private async ensureLogDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }
  
  private initializeDatabase(): void {
    this.db = new sqlite3.Database(path.join(process.cwd(), 'activity_log.db'));
    
    this.db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        event_type TEXT NOT NULL,
        details TEXT NOT NULL,
        severity TEXT DEFAULT 'medium',
        session_id TEXT,
        user_id TEXT,
        risk_score INTEGER,
        business_value INTEGER
      )
    `);
    
    this.db.run(`
      CREATE TABLE IF NOT EXISTS threat_intelligence (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        threat_type TEXT NOT NULL,
        trader_classification TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        business_value INTEGER NOT NULL,
        indicators TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        session_id TEXT,
        automated_actions TEXT,
        manual_review_required BOOLEAN DEFAULT 0
      )
    `);
    
    console.log('📊 Enhanced logging database initialized');
  }
  
  // Core logging functionality
  public async logEvent(eventType: string, details: any, metadata?: Partial<LogEvent>): Promise<void> {
    const logEvent: LogEvent = {
      timestamp: new Date().toISOString(),
      eventType,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      severity: metadata?.severity || 'medium',
      sessionId: metadata?.sessionId,
      userId: metadata?.userId,
      riskScore: metadata?.riskScore,
      businessValue: metadata?.businessValue
    };
    
    // SQLite logging
    this.db.run(
      `INSERT INTO events (timestamp, event_type, details, severity, session_id, user_id, risk_score, business_value) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logEvent.timestamp,
        logEvent.eventType,
        logEvent.details,
        logEvent.severity,
        logEvent.sessionId,
        logEvent.userId,
        logEvent.riskScore,
        logEvent.businessValue
      ]
    );
    
    // JSON file logging for easy analysis
    await this.logToJsonFile(logEvent);
    
    // Console logging with enhanced formatting
    this.formatConsoleLog(logEvent);
  }
  
  // Specialized threat intelligence logging
  public async logThreatIntelligence(threatData: {
    threatType: string;
    traderClassification: string;
    riskScore: number;
    businessValue: number;
    indicators: string[];
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    automatedActions: string[];
    manualReviewRequired: boolean;
  }): Promise<void> {
    const timestamp = new Date().toISOString();
    
    this.db.run(
      `INSERT INTO threat_intelligence 
       (timestamp, threat_type, trader_classification, risk_score, business_value, 
        indicators, ip_address, user_agent, session_id, automated_actions, manual_review_required)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        timestamp,
        threatData.threatType,
        threatData.traderClassification,
        threatData.riskScore,
        threatData.businessValue,
        threatData.indicators.join(','),
        threatData.ipAddress,
        threatData.userAgent,
        threatData.sessionId,
        threatData.automatedActions.join(','),
        threatData.manualReviewRequired ? 1 : 0
      ]
    );
    
    // Special CSV export for threat intelligence
    await this.exportThreatIntelligenceCSV(threatData, timestamp);
    
    console.log(`🚨 THREAT INTELLIGENCE LOGGED: ${threatData.threatType} - ${threatData.traderClassification}`, {
      riskScore: threatData.riskScore,
      businessValue: threatData.businessValue,
      sessionId: threatData.sessionId
    });
  }
  
  // CSV export for business intelligence
  public async exportBusinessProspectsCSV(prospects: any[]): Promise<void> {
    const csvPath = path.join(this.logDir, 'business_prospects.csv');
    const headers = [
      'timestamp',
      'session_id',
      'trader_type',
      'business_value_score',
      'estimated_revenue',
      'contact_route',
      'priority',
      'indicators',
      'ip_address',
      'user_agent'
    ];
    
    try {
      let csvContent = headers.join(',') + '\n';
      
      for (const prospect of prospects) {
        const row = [
          new Date().toISOString(),
          prospect.sessionId || '',
          prospect.traderType || '',
          prospect.businessValue || 0,
          prospect.estimatedRevenue || 0,
          prospect.contactRoute || '',
          prospect.priority || '',
          (prospect.indicators || []).join(';'),
          prospect.ipAddress || '',
          prospect.userAgent || ''
        ].map(field => `"${field}"`).join(',');
        
        csvContent += row + '\n';
      }
      
      await fs.writeFile(csvPath, csvContent, 'utf8');
      console.log(`📊 Business prospects exported to CSV: ${csvPath}`);
    } catch (error) {
      console.error('Failed to export business prospects CSV:', error);
    }
  }
  
  // Security events export
  public async exportSecurityEventsCSV(fromDate?: Date, toDate?: Date): Promise<void> {
    const csvPath = path.join(this.logDir, `security_events_${Date.now()}.csv`);
    
    return new Promise((resolve, reject) => {
      let query = `SELECT * FROM events WHERE event_type LIKE '%security%' OR event_type LIKE '%threat%'`;
      const params: any[] = [];
      
      if (fromDate) {
        query += ` AND timestamp >= ?`;
        params.push(fromDate.toISOString());
      }
      
      if (toDate) {
        query += ` AND timestamp <= ?`;
        params.push(toDate.toISOString());
      }
      
      query += ` ORDER BY timestamp DESC`;
      
      this.db.all(query, params, async (err, rows: any[]) => {
        if (err) {
          console.error('Failed to export security events:', err);
          reject(err);
          return;
        }
        
        try {
          const headers = Object.keys(rows[0] || {});
          let csvContent = headers.join(',') + '\n';
          
          for (const row of rows) {
            const csvRow = headers.map(header => `"${row[header] || ''}"`).join(',');
            csvContent += csvRow + '\n';
          }
          
          await fs.writeFile(csvPath, csvContent, 'utf8');
          console.log(`🔒 Security events exported to CSV: ${csvPath}`);
          resolve();
        } catch (error) {
          console.error('Failed to write security events CSV:', error);
          reject(error);
        }
      });
    });
  }
  
  // Private helper methods
  private async logToJsonFile(logEvent: LogEvent): Promise<void> {
    const jsonPath = path.join(this.logDir, `events_${new Date().toISOString().split('T')[0]}.json`);
    
    try {
      let existingData: LogEvent[] = [];
      try {
        const existingContent = await fs.readFile(jsonPath, 'utf8');
        existingData = JSON.parse(existingContent);
      } catch (error) {
        // File doesn't exist or is empty, start with empty array
      }
      
      existingData.push(logEvent);
      await fs.writeFile(jsonPath, JSON.stringify(existingData, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to write JSON log:', error);
    }
  }
  
  private async exportThreatIntelligenceCSV(threatData: any, timestamp: string): Promise<void> {
    const csvPath = path.join(this.logDir, 'threat_intelligence.csv');
    const headers = [
      'timestamp',
      'threat_type',
      'trader_classification',
      'risk_score',
      'business_value',
      'indicators',
      'ip_address',
      'user_agent',
      'session_id',
      'automated_actions',
      'manual_review_required'
    ];
    
    try {
      // Check if file exists to determine if we need headers
      let needsHeaders = false;
      try {
        await fs.access(csvPath);
      } catch {
        needsHeaders = true;
      }
      
      const row = [
        timestamp,
        threatData.threatType,
        threatData.traderClassification,
        threatData.riskScore,
        threatData.businessValue,
        threatData.indicators.join(';'),
        threatData.ipAddress,
        threatData.userAgent,
        threatData.sessionId,
        threatData.automatedActions.join(';'),
        threatData.manualReviewRequired
      ].map(field => `"${field}"`).join(',');
      
      const content = needsHeaders ? headers.join(',') + '\n' + row + '\n' : row + '\n';
      await fs.appendFile(csvPath, content, 'utf8');
    } catch (error) {
      console.error('Failed to export threat intelligence CSV:', error);
    }
  }
  
  private formatConsoleLog(logEvent: LogEvent): void {
    const severityEmoji = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };
    
    const emoji = severityEmoji[logEvent.severity || 'medium'];
    const formattedTime = new Date(logEvent.timestamp).toLocaleTimeString();
    
    console.log(`${emoji} [${formattedTime}] [${logEvent.eventType.toUpperCase()}] ${logEvent.details}`, {
      ...(logEvent.sessionId && { sessionId: logEvent.sessionId }),
      ...(logEvent.riskScore && { riskScore: logEvent.riskScore }),
      ...(logEvent.businessValue && { businessValue: logEvent.businessValue })
    });
  }
  
  // Query methods for analysis
  public async getRecentEvents(limit: number = 100): Promise<LogEvent[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM events ORDER BY timestamp DESC LIMIT ?`,
        [limit],
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows as LogEvent[]);
        }
      );
    });
  }
  
  public async getThreatIntelligenceReport(days: number = 7): Promise<any[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM threat_intelligence WHERE timestamp >= ? ORDER BY risk_score DESC`,
        [since],
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
  
  // Cleanup method
  public async cleanup(): Promise<void> {
    this.db.close();
  }
}

export const enhancedLogger = new EnhancedLogger();