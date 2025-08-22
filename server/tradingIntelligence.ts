/*
 * AlphaForge - Trading Intelligence & Behavioral Analysis
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Advanced trading behavior classification and monitoring system.
 * Unauthorized access, copying, or distribution is strictly prohibited.
 */

import { traceUserAction, traceSecurityEvent } from "./observability";

interface TradingActivity {
  userId: string;
  sessionId: string;
  orderSize: number;
  algoType?: string;
  venue: string;
  appType: string;
  frequencyPerHour: number;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  strategy?: string;
  symbol?: string;
  orderType: string;
  executionTime: number;
  latency: number;
}

interface TraderClassification {
  traderType: 'institutional' | 'retail' | 'prop_trading' | 'hedge_fund' | 'uncertain';
  confidence: number;
  indicators: string[];
  riskScore: number;
  businessValue: number;
}

interface TradingSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  totalTrades: number;
  totalVolume: number;
  averageOrderSize: number;
  algorithmsUsed: string[];
  venues: string[];
  deviceFingerprint: string;
  geoLocation?: string;
}

export class TradingIntelligenceService {
  
  // Classify trader based on advanced behavioral analysis
  public classifyTrader(activity: TradingActivity): TraderClassification {
    let confidence = 0;
    const indicators: string[] = [];
    let traderType: 'institutional' | 'retail' | 'prop_trading' | 'hedge_fund' | 'uncertain' = 'uncertain';
    let riskScore = 0;
    let businessValue = 0;
    
    // Institutional indicators
    if (activity.orderSize >= 10000) {
      confidence += 30;
      indicators.push('large_order_size');
      businessValue += 50;
    }
    
    if (activity.algoType && ['VWAP', 'TWAP', 'Iceberg', 'POV', 'Implementation_Shortfall'].includes(activity.algoType)) {
      confidence += 35;
      indicators.push(`institutional_algo:${activity.algoType}`);
      traderType = 'institutional';
      businessValue += 75;
    }
    
    if (activity.venue === 'dark_pool' || activity.venue === 'direct_market_access') {
      confidence += 40;
      indicators.push(`institutional_venue:${activity.venue}`);
      traderType = 'institutional';
      businessValue += 60;
    }
    
    if (activity.frequencyPerHour > 50) {
      confidence += 25;
      indicators.push('high_frequency_trading');
      traderType = 'institutional';
      businessValue += 40;
    }
    
    // Execution speed analysis (institutional systems are typically faster)
    if (activity.executionTime < 100) { // microseconds
      confidence += 20;
      indicators.push('ultra_low_latency');
      traderType = 'institutional';
      businessValue += 30;
    }
    
    // Proprietary trading indicators
    if (activity.orderSize >= 50000 && activity.frequencyPerHour > 100) {
      confidence += 45;
      indicators.push('prop_trading_pattern');
      traderType = 'prop_trading';
      businessValue += 100;
    }
    
    // Hedge fund indicators
    if (activity.algoType === 'Alpha_Generation' || activity.venue === 'prime_brokerage') {
      confidence += 50;
      indicators.push('hedge_fund_infrastructure');
      traderType = 'hedge_fund';
      businessValue += 150;
    }
    
    // Retail indicators
    if (activity.orderSize <= 5000 && !activity.algoType) {
      confidence += 20;
      indicators.push('retail_order_size');
      traderType = 'retail';
      businessValue += 10;
    }
    
    if (activity.appType === 'mobile' || activity.venue === 'retail_broker') {
      confidence += 30;
      indicators.push(`retail_platform:${activity.appType || activity.venue}`);
      traderType = 'retail';
      businessValue += 5;
    }
    
    // Risk assessment for competitive intelligence
    if (traderType === 'institutional' || traderType === 'prop_trading') {
      riskScore = 25; // Higher risk of IP theft or competitive analysis
    } else if (traderType === 'hedge_fund') {
      riskScore = 40; // Very high value target for competitors
    } else {
      riskScore = 5; // Low risk retail users
    }
    
    return {
      traderType,
      confidence: Math.min(confidence, 100),
      indicators,
      riskScore,
      businessValue
    };
  }
  
  // Enhanced analysis with session context
  public analyzeTradeWithContext(activity: TradingActivity, session: TradingSession): TraderClassification {
    const baseClassification = this.classifyTrader(activity);
    
    // Session-level analysis adjustments
    if (session.totalTrades > 1000 && session.averageOrderSize > 25000) {
      baseClassification.confidence += 20;
      baseClassification.indicators.push('institutional_session_pattern');
      baseClassification.businessValue += 75;
    }
    
    if (session.algorithmsUsed.length > 3) {
      baseClassification.confidence += 15;
      baseClassification.indicators.push('multiple_algorithm_usage');
      baseClassification.businessValue += 50;
    }
    
    if (session.venues.includes('dark_pool') && session.venues.includes('direct_market_access')) {
      baseClassification.confidence += 25;
      baseClassification.indicators.push('multi_venue_sophistication');
      baseClassification.traderType = 'institutional';
      baseClassification.businessValue += 100;
    }
    
    return baseClassification;
  }
  
  // Log trading activity with enhanced Arize AI integration
  public logTradingActivity(activity: TradingActivity, session: TradingSession): void {
    const classification = this.analyzeTradeWithContext(activity, session);
    
    // Enhanced Arize AI trace with rich trading intelligence
    traceUserAction('trading_behavior_analysis', 'trade_classified', {
      // Core classification
      'trader.type': classification.traderType,
      'trader.confidence': classification.confidence,
      'trader.risk_score': classification.riskScore,
      'trader.business_value': classification.businessValue,
      'trader.indicators_count': classification.indicators.length,
      
      // Trading activity details
      'trade.order_size': activity.orderSize,
      'trade.algo_type': activity.algoType || 'manual',
      'trade.venue': activity.venue,
      'trade.app_type': activity.appType,
      'trade.frequency_per_hour': activity.frequencyPerHour,
      'trade.execution_time_ms': activity.executionTime,
      'trade.latency_ms': activity.latency,
      'trade.symbol': activity.symbol || 'unknown',
      'trade.order_type': activity.orderType,
      
      // Session intelligence
      'session.total_trades': session.totalTrades,
      'session.total_volume': session.totalVolume,
      'session.average_order_size': session.averageOrderSize,
      'session.algorithms_used': session.algorithmsUsed.join(','),
      'session.venues': session.venues.join(','),
      'session.duration_minutes': session.endTime ? 
        Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000) : 0,
      
      // Competitive intelligence
      'intelligence.indicators': classification.indicators.join(','),
      'intelligence.institutional_detected': classification.traderType !== 'retail',
      'intelligence.high_value_target': classification.businessValue > 100,
      
      // Technical fingerprint
      'technical.ip_address': activity.ipAddress,
      'technical.user_agent': activity.userAgent,
      'technical.device_fingerprint': session.deviceFingerprint,
      'technical.geo_location': session.geoLocation || 'unknown'
    });
    
    // Special high-priority trace for institutional traders
    if (classification.traderType === 'institutional' || 
        classification.traderType === 'prop_trading' || 
        classification.traderType === 'hedge_fund') {
      
      traceSecurityEvent('institutional_trader_detected', 
        `High-value ${classification.traderType} trader identified`, {
        'trader.type': classification.traderType,
        'trader.confidence': classification.confidence,
        'trader.business_value': classification.businessValue,
        'trade.order_size': activity.orderSize,
        'trade.algo_type': activity.algoType || 'manual',
        'intelligence.priority': 'high',
        'intelligence.arize_notification': 'enabled',
        'session.id': session.sessionId,
        'user.id': activity.userId,
        timestamp: activity.timestamp.toISOString()
      });
      
      console.log(`🎯 HIGH-VALUE INSTITUTIONAL TRADER DETECTED`, {
        traderType: classification.traderType,
        confidence: classification.confidence,
        businessValue: classification.businessValue,
        orderSize: activity.orderSize,
        indicators: classification.indicators,
        sessionId: session.sessionId,
        userId: activity.userId
      });
    }
    
    // Competitive intelligence logging for potential IP threats
    if (classification.riskScore > 30) {
      traceSecurityEvent('competitive_trading_analysis', 
        `Potential competitor analyzing trading capabilities`, {
        'threat.risk_score': classification.riskScore,
        'threat.trader_type': classification.traderType,
        'threat.business_value': classification.businessValue,
        'threat.indicators': classification.indicators.join(','),
        'analysis.sophisticated_trading': classification.confidence > 70,
        'analysis.ip_threat_level': classification.riskScore > 50 ? 'high' : 'medium',
        'session.id': session.sessionId,
        'user.id': activity.userId,
        timestamp: activity.timestamp.toISOString()
      });
    }
  }
  
  // Generate trading intelligence summary for Arize AI dashboards
  public generateTradingIntelligenceReport(activities: TradingActivity[], sessions: TradingSession[]): any {
    const classifications = activities.map(activity => {
      const session = sessions.find(s => s.sessionId === activity.sessionId);
      return session ? this.analyzeTradeWithContext(activity, session) : this.classifyTrader(activity);
    });
    
    const institutionalCount = classifications.filter(c => c.traderType === 'institutional').length;
    const retailCount = classifications.filter(c => c.traderType === 'retail').length;
    const propTradingCount = classifications.filter(c => c.traderType === 'prop_trading').length;
    const hedgeFundCount = classifications.filter(c => c.traderType === 'hedge_fund').length;
    
    const totalBusinessValue = classifications.reduce((sum, c) => sum + c.businessValue, 0);
    const avgRiskScore = classifications.reduce((sum, c) => sum + c.riskScore, 0) / classifications.length;
    
    const report = {
      summary: {
        total_activities: activities.length,
        institutional_traders: institutionalCount,
        retail_traders: retailCount,
        prop_trading_firms: propTradingCount,
        hedge_funds: hedgeFundCount,
        total_business_value: totalBusinessValue,
        average_risk_score: Math.round(avgRiskScore * 100) / 100
      },
      high_value_targets: classifications
        .filter(c => c.businessValue > 100)
        .map(c => ({
          type: c.traderType,
          confidence: c.confidence,
          business_value: c.businessValue,
          indicators: c.indicators
        })),
      competitive_threats: classifications
        .filter(c => c.riskScore > 30)
        .map(c => ({
          type: c.traderType,
          risk_score: c.riskScore,
          threat_indicators: c.indicators
        }))
    };
    
    return report;
  }
}

export const tradingIntelligenceService = new TradingIntelligenceService();