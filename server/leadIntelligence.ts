/*
 * AlphaForge - Lead Intelligence & Trade Desk Detection
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Advanced lead capture and competitive intelligence system.
 * Unauthorized access, copying, or distribution is strictly prohibited.
 */

import { traceUserAction } from "./observability";

interface LeadProfile {
  // Basic contact info
  email: string;
  company?: string;
  role?: string;
  name?: string;
  phone?: string;
  
  // Technical fingerprint
  browserFingerprint: string;
  deviceType: string;
  operatingSystem: string;
  screenResolution: string;
  timezone: string;
  language: string;
  
  // Behavioral data
  pageViews: number;
  timeOnSite: number;
  featuresViewed: string[];
  downloadedContent: string[];
  
  // Traffic source intelligence
  referrerDomain?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  searchKeywords?: string;
}

interface TradeDesktAnalysis {
  isTradeDesk: boolean;
  riskScore: number;
  indicators: string[];
  businessModel: string;
  companyType: string;
  tradingVolume: string;
  primaryAssets: string;
}

export class LeadIntelligenceService {
  
  // Detect if lead is from a trade desk or competitive entity
  public analyzeTradeDesk(profile: LeadProfile): TradeDesktAnalysis {
    let riskScore = 0;
    const indicators: string[] = [];
    let businessModel = 'unknown';
    let companyType = 'unknown';
    let tradingVolume = 'unknown';
    let primaryAssets = 'unknown';
    
    // Company name analysis
    if (profile.company) {
      const company = profile.company.toLowerCase();
      
      // Direct trade desk identifiers
      const tradeDeskKeywords = [
        'trade desk', 'trading desk', 'trillium', 'albion',
        'prop trading', 'proprietary trading', 'market maker',
        'hedge fund', 'capital management', 'investments',
        'quantitative', 'algorithmic trading', 'systematic'
      ];
      
      tradeDeskKeywords.forEach(keyword => {
        if (company.includes(keyword)) {
          riskScore += 25;
          indicators.push(`company_name:${keyword}`);
          companyType = this.categorizeCompany(keyword);
          businessModel = 'institutional';
        }
      });
      
      // Competitor companies
      const competitors = [
        'quantconnect', 'quantopian', 'interactive brokers',
        'td ameritrade', 'e*trade', 'charles schwab',
        'robinhood', 'webull', 'alpaca', 'thinkorswim'
      ];
      
      competitors.forEach(competitor => {
        if (company.includes(competitor)) {
          riskScore += 40;
          indicators.push(`competitor:${competitor}`);
          companyType = 'competitor';
        }
      });
    }
    
    // Email domain analysis
    const emailDomain = profile.email.split('@')[1]?.toLowerCase();
    if (emailDomain) {
      const suspiciousDomains = [
        'trillium.com', 'albion.com', 'citadel.com',
        'janestreet.com', 'optiver.com', 'susquehanna.com',
        'quantconnect.com', 'interactivebrokers.com'
      ];
      
      if (suspiciousDomains.includes(emailDomain)) {
        riskScore += 50;
        indicators.push(`suspicious_domain:${emailDomain}`);
        companyType = 'high_risk_competitor';
      }
      
      // Generic domains with high activity (potential competitors using fake emails)
      if (['gmail.com', 'yahoo.com', 'hotmail.com'].includes(emailDomain) && profile.pageViews > 20) {
        riskScore += 10;
        indicators.push('high_activity_generic_email');
      }
    }
    
    // Role analysis
    if (profile.role) {
      const role = profile.role.toLowerCase();
      const tradingRoles = [
        'trader', 'portfolio manager', 'quantitative analyst',
        'risk manager', 'algorithmic trading', 'systematic trading',
        'prop trader', 'head of trading', 'cto', 'ceo'
      ];
      
      tradingRoles.forEach(tradingRole => {
        if (role.includes(tradingRole)) {
          riskScore += 15;
          indicators.push(`trading_role:${tradingRole}`);
          if (role.includes('head') || role.includes('cto') || role.includes('ceo')) {
            riskScore += 10;
            indicators.push('senior_decision_maker');
          }
        }
      });
    }
    
    // Behavioral analysis for IP infringement risk
    if (profile.featuresViewed.includes('quantum-optimization') || 
        profile.featuresViewed.includes('algorithm-builder')) {
      riskScore += 15;
      indicators.push('proprietary_feature_interest');
    }
    
    if (profile.downloadedContent.length > 3) {
      riskScore += 10;
      indicators.push('excessive_content_download');
    }
    
    if (profile.timeOnSite > 1800) { // 30+ minutes
      riskScore += 10;
      indicators.push('extensive_platform_analysis');
    }
    
    // Traffic source analysis
    if (profile.searchKeywords) {
      const competitiveKeywords = [
        'quantum trading', 'algorithmic trading platform',
        'proprietary trading software', 'trade desk software',
        'quantconnect alternative', 'trading bot platform'
      ];
      
      competitiveKeywords.forEach(keyword => {
        if (profile.searchKeywords!.toLowerCase().includes(keyword)) {
          riskScore += 5;
          indicators.push(`competitive_search:${keyword}`);
        }
      });
    }
    
    // Estimate trading volume and assets based on company type and role
    if (companyType.includes('hedge_fund') || companyType.includes('prop_trading')) {
      tradingVolume = '100M+';
      primaryAssets = 'equities,options,futures';
    } else if (companyType.includes('market_maker')) {
      tradingVolume = '100M+';
      primaryAssets = 'equities,options,etfs';
    } else if (companyType.includes('family_office')) {
      tradingVolume = '10M-100M';
      primaryAssets = 'equities,fixed_income';
    }
    
    return {
      isTradeDesk: riskScore >= 30,
      riskScore: Math.min(riskScore, 100),
      indicators,
      businessModel,
      companyType,
      tradingVolume,
      primaryAssets
    };
  }
  
  private categorizeCompany(keyword: string): string {
    const categoryMap: Record<string, string> = {
      'hedge fund': 'hedge_fund',
      'prop trading': 'prop_trading',
      'proprietary trading': 'prop_trading',
      'market maker': 'market_maker',
      'trade desk': 'trade_desk',
      'trading desk': 'trade_desk',
      'capital management': 'asset_manager',
      'investments': 'investment_firm',
      'quantitative': 'quant_firm',
      'algorithmic trading': 'algo_trading',
      'systematic': 'systematic_trading'
    };
    
    return categoryMap[keyword] || 'financial_services';
  }
  
  // Generate browser fingerprint for tracking
  public generateFingerprint(req: any): string {
    const userAgent = req.get('User-Agent') || '';
    const acceptLanguage = req.get('Accept-Language') || '';
    const acceptEncoding = req.get('Accept-Encoding') || '';
    const ip = req.ip || '';
    
    // Create a semi-unique fingerprint (not perfect, but useful for tracking)
    const fingerprint = Buffer.from(
      `${userAgent}:${acceptLanguage}:${acceptEncoding}:${ip}`
    ).toString('base64').substring(0, 32);
    
    return fingerprint;
  }
  
  // Extract device and browser information
  public analyzeUserAgent(userAgent: string) {
    const ua = userAgent.toLowerCase();
    
    let deviceType = 'desktop';
    if (ua.includes('mobile')) deviceType = 'mobile';
    else if (ua.includes('tablet')) deviceType = 'tablet';
    
    let operatingSystem = 'unknown';
    if (ua.includes('windows')) operatingSystem = 'windows';
    else if (ua.includes('mac')) operatingSystem = 'macos';
    else if (ua.includes('linux')) operatingSystem = 'linux';
    else if (ua.includes('android')) operatingSystem = 'android';
    else if (ua.includes('ios')) operatingSystem = 'ios';
    
    return { deviceType, operatingSystem };
  }
  
  // Check for suspicious behavioral patterns
  public detectBadActorPatterns(profile: LeadProfile): number {
    let badActorScore = 0;
    
    // Rapid page consumption (bot-like behavior)
    if (profile.pageViews > 50 && profile.timeOnSite < 300) {
      badActorScore += 30;
    }
    
    // Viewing only technical/proprietary features
    const technicalFeatures = profile.featuresViewed.filter(f => 
      f.includes('quantum') || f.includes('algorithm') || f.includes('api')
    );
    
    if (technicalFeatures.length === profile.featuresViewed.length && technicalFeatures.length > 5) {
      badActorScore += 25;
    }
    
    // Downloading everything without engagement
    if (profile.downloadedContent.length > 5 && profile.timeOnSite < 600) {
      badActorScore += 20;
    }
    
    return Math.min(badActorScore, 100);
  }
  
  // Enhanced lead capture with full intelligence
  public async captureEnhancedLead(
    sessionId: string,
    basicInfo: { name: string; email: string; role: string; company?: string; phone?: string },
    req: any,
    behavioralData: { pageViews: number; timeOnSite: number; featuresViewed: string[]; downloadedContent: string[] }
  ): Promise<void> {
    
    // Generate technical fingerprint
    const browserFingerprint = this.generateFingerprint(req);
    const { deviceType, operatingSystem } = this.analyzeUserAgent(req.get('User-Agent') || '');
    
    // Build comprehensive profile
    const profile: LeadProfile = {
      ...basicInfo,
      browserFingerprint,
      deviceType,
      operatingSystem,
      screenResolution: 'unknown', // Would come from frontend JavaScript
      timezone: 'unknown', // Would come from frontend JavaScript
      language: req.get('Accept-Language')?.split(',')[0] || 'unknown',
      ...behavioralData,
      referrerDomain: req.get('Referer') ? new URL(req.get('Referer')).hostname : undefined,
      utmSource: req.query.utm_source as string,
      utmMedium: req.query.utm_medium as string,
      utmCampaign: req.query.utm_campaign as string,
      searchKeywords: req.query.keywords as string,
    };
    
    // Analyze for trade desk and competitive intelligence
    const tradeDeskAnalysis = this.analyzeTradeDesk(profile);
    const badActorScore = this.detectBadActorPatterns(profile);
    
    // Log high-priority intelligence
    if (tradeDeskAnalysis.isTradeDesk || badActorScore > 50) {
      console.log(`🎯 HIGH-VALUE LEAD DETECTED: Trade desk analysis completed`, {
        email: profile.email,
        company: profile.company,
        isTradeDesk: tradeDeskAnalysis.isTradeDesk,
        riskScore: tradeDeskAnalysis.riskScore,
        badActorScore,
        indicators: tradeDeskAnalysis.indicators
      });
      
      // Trace competitive intelligence event
      traceUserAction('competitive_intelligence', 'lead_captured', {
        'lead.email': profile.email,
        'lead.company': profile.company || 'unknown',
        'lead.trade_desk_detected': tradeDeskAnalysis.isTradeDesk,
        'lead.risk_score': tradeDeskAnalysis.riskScore,
        'lead.business_model': tradeDeskAnalysis.businessModel,
        'lead.company_type': tradeDeskAnalysis.companyType,
        'lead.suspicious_indicators_count': tradeDeskAnalysis.indicators.length
      });
    }
    
    // Store in database with enhanced fields
    // This would integrate with the storage system to save all the enhanced data
    console.log(`📊 Enhanced lead profile captured for: ${profile.email}`);
  }
}

export const leadIntelligenceService = new LeadIntelligenceService();