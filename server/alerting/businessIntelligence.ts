/*
 * AlphaForge - Business Intelligence Router
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Automated business prospect routing and CRM integration using free services.
 * Unauthorized access, copying, or distribution is strictly prohibited.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { enhancedLogger } from './logger';

interface BusinessProspect {
  timestamp: string;
  sessionId: string;
  traderType: 'hedge_fund' | 'prop_trading' | 'institutional' | 'enterprise' | 'retail';
  businessValueScore: number;
  estimatedRevenue: number;
  contactRoute: 'sales' | 'business_development' | 'partnership' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  ipAddress: string;
  userAgent: string;
  detectedFeatures: string[];
  riskAssessment: string;
  conversionProbability: number;
  followUpActions: string[];
}

interface CRMEntry {
  leadId: string;
  leadSource: 'threat_detection' | 'competitive_intelligence' | 'organic_signup';
  companyType: string;
  priority: string;
  estimatedValue: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'closed_won' | 'closed_lost';
  assignedTo: string;
  notes: string;
  createdAt: string;
  lastActivity: string;
}

export class BusinessIntelligenceRouter {
  private prospectsDir: string;
  private crmFile: string;
  
  constructor() {
    this.prospectsDir = path.join(process.cwd(), 'business_intelligence');
    this.crmFile = path.join(this.prospectsDir, 'crm_prospects.csv');
    this.initializeDirectories();
  }
  
  private async initializeDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.prospectsDir, { recursive: true });
      console.log('📊 Business Intelligence system initialized');
    } catch (error) {
      console.error('Failed to create BI directory:', error);
    }
  }
  
  // Main prospect routing function
  public async routeProspect(prospectData: {
    sessionId: string;
    traderType: string;
    businessValueScore: number;
    riskScore: number;
    indicators: string[];
    ipAddress: string;
    userAgent: string;
    detectedFeatures: string[];
  }): Promise<void> {
    const prospect = this.createBusinessProspect(prospectData);
    
    // Multiple output formats for maximum compatibility
    await Promise.all([
      this.exportToCSV(prospect),
      this.exportToJSON(prospect),
      this.updateCRM(prospect),
      this.generateProspectReport(prospect)
    ]);
    
    // Specialized routing based on prospect type
    await this.executeSpecializedRouting(prospect);
    
    console.log(`💼 Business prospect routed: ${prospect.traderType} - $${prospect.estimatedRevenue.toLocaleString()}`, {
      priority: prospect.priority,
      contactRoute: prospect.contactRoute,
      conversionProbability: `${prospect.conversionProbability}%`
    });
  }
  
  private createBusinessProspect(data: any): BusinessProspect {
    const estimatedRevenue = this.calculateEstimatedRevenue(data.traderType, data.businessValueScore);
    const priority = this.calculatePriority(data.businessValueScore, data.riskScore);
    const contactRoute = this.determineContactRoute(data.traderType);
    const conversionProbability = this.calculateConversionProbability(data);
    
    return {
      timestamp: new Date().toISOString(),
      sessionId: data.sessionId,
      traderType: data.traderType as any,
      businessValueScore: data.businessValueScore,
      estimatedRevenue,
      contactRoute,
      priority,
      indicators: data.indicators,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      detectedFeatures: data.detectedFeatures,
      riskAssessment: this.assessRisk(data.riskScore),
      conversionProbability,
      followUpActions: this.generateFollowUpActions(data.traderType, priority)
    };
  }
  
  private calculateEstimatedRevenue(traderType: string, businessValue: number): number {
    const baseValue = businessValue * 1000; // $1K per business value point
    
    const multipliers = {
      hedge_fund: 5.0,      // $500K+ potential
      prop_trading: 3.5,    // $350K+ potential
      institutional: 2.5,   // $250K+ potential
      enterprise: 2.0,      // $200K+ potential
      retail: 1.0           // $100K+ potential
    };
    
    return Math.round(baseValue * (multipliers[traderType as keyof typeof multipliers] || 1.0));
  }
  
  private calculatePriority(businessValue: number, riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    // High business value + low risk = highest priority
    if (businessValue > 150 && riskScore < 100) return 'critical';
    if (businessValue > 120) return 'high';
    if (businessValue > 100) return 'medium';
    return 'low';
  }
  
  private determineContactRoute(traderType: string): 'sales' | 'business_development' | 'partnership' | 'security' {
    const routes: Record<string, 'sales' | 'business_development' | 'partnership' | 'security'> = {
      hedge_fund: 'partnership',
      prop_trading: 'business_development',
      institutional: 'sales',
      enterprise: 'sales',
      retail: 'sales'
    };
    
    return routes[traderType] || 'sales';
  }
  
  private calculateConversionProbability(data: any): number {
    let probability = 30; // Base 30%
    
    // Increase based on sophistication indicators
    if (data.detectedFeatures.includes('quantum_algorithms')) probability += 25;
    if (data.detectedFeatures.includes('institutional_trading')) probability += 20;
    if (data.indicators.some((i: string) => i.includes('hedge') || i.includes('institutional'))) probability += 15;
    
    // Decrease based on risk factors
    if (data.riskScore > 150) probability -= 20;
    if (data.indicators.some((i: string) => i.includes('bot') || i.includes('scraper'))) probability -= 15;
    
    return Math.max(10, Math.min(85, probability)); // Keep between 10-85%
  }
  
  private assessRisk(riskScore: number): string {
    if (riskScore > 150) return 'High - Potential competitive threat';
    if (riskScore > 100) return 'Medium - Monitor closely';
    return 'Low - Standard business prospect';
  }
  
  private generateFollowUpActions(traderType: string, priority: string): string[] {
    const baseActions = [
      'Create custom demo showcasing quantum trading features',
      'Prepare enterprise pricing proposal',
      'Research company background and decision makers'
    ];
    
    const typeSpecificActions = {
      hedge_fund: [
        'Prepare institutional partnership proposal',
        'Highlight regulatory compliance features',
        'Schedule technical deep-dive with CTO'
      ],
      prop_trading: [
        'Demonstrate high-frequency trading capabilities',
        'Prepare volume-based pricing model',
        'Showcase latency optimization features'
      ],
      institutional: [
        'Prepare enterprise security compliance documentation',
        'Schedule board-level presentation',
        'Develop custom integration proposal'
      ]
    };
    
    const actions = [...baseActions];
    if (typeSpecificActions[traderType as keyof typeof typeSpecificActions]) {
      actions.push(...typeSpecificActions[traderType as keyof typeof typeSpecificActions]);
    }
    
    if (priority === 'critical') {
      actions.unshift('Immediate executive team notification');
    }
    
    return actions;
  }
  
  // Export to CSV for CRM import
  private async exportToCSV(prospect: BusinessProspect): Promise<void> {
    const csvPath = path.join(this.prospectsDir, 'business_prospects.csv');
    const headers = [
      'timestamp', 'session_id', 'trader_type', 'business_value_score',
      'estimated_revenue', 'contact_route', 'priority', 'indicators',
      'ip_address', 'user_agent', 'detected_features', 'risk_assessment',
      'conversion_probability', 'follow_up_actions'
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
        prospect.timestamp,
        prospect.sessionId,
        prospect.traderType,
        prospect.businessValueScore,
        prospect.estimatedRevenue,
        prospect.contactRoute,
        prospect.priority,
        prospect.indicators.join(';'),
        prospect.ipAddress,
        prospect.userAgent,
        prospect.detectedFeatures.join(';'),
        prospect.riskAssessment,
        prospect.conversionProbability,
        prospect.followUpActions.join(';')
      ].map(field => `"${field}"`).join(',');
      
      const content = needsHeaders ? headers.join(',') + '\n' + row + '\n' : row + '\n';
      await fs.appendFile(csvPath, content, 'utf8');
      
      console.log('📊 Prospect exported to CSV for CRM import');
    } catch (error) {
      console.error('Failed to export prospect CSV:', error);
    }
  }
  
  // Export to JSON for API integration
  private async exportToJSON(prospect: BusinessProspect): Promise<void> {
    const jsonPath = path.join(this.prospectsDir, `prospect_${prospect.sessionId}.json`);
    
    try {
      await fs.writeFile(jsonPath, JSON.stringify(prospect, null, 2), 'utf8');
      console.log('📊 Prospect exported to JSON for API integration');
    } catch (error) {
      console.error('Failed to export prospect JSON:', error);
    }
  }
  
  // Update simplified CRM system
  private async updateCRM(prospect: BusinessProspect): Promise<void> {
    const crmEntry: CRMEntry = {
      leadId: `THREAT_${prospect.sessionId}`,
      leadSource: 'threat_detection',
      companyType: prospect.traderType,
      priority: prospect.priority,
      estimatedValue: prospect.estimatedRevenue,
      status: 'new',
      assignedTo: this.getAssignedTeamMember(prospect.contactRoute),
      notes: `Detected via security monitoring. Indicators: ${prospect.indicators.join(', ')}. Risk: ${prospect.riskAssessment}`,
      createdAt: prospect.timestamp,
      lastActivity: prospect.timestamp
    };
    
    await this.appendToCRM(crmEntry);
  }
  
  private async appendToCRM(entry: CRMEntry): Promise<void> {
    const headers = Object.keys(entry);
    
    try {
      // Check if CRM file exists
      let needsHeaders = false;
      try {
        await fs.access(this.crmFile);
      } catch {
        needsHeaders = true;
      }
      
      const row = Object.values(entry).map(field => `"${field}"`).join(',');
      const content = needsHeaders ? headers.join(',') + '\n' + row + '\n' : row + '\n';
      
      await fs.appendFile(this.crmFile, content, 'utf8');
      console.log('📊 CRM entry created for prospect');
    } catch (error) {
      console.error('Failed to update CRM:', error);
    }
  }
  
  private getAssignedTeamMember(route: string): string {
    const assignments = {
      sales: 'Sales Team',
      business_development: 'BD Team',
      partnership: 'Partnership Team',
      security: 'Security Team'
    };
    
    return assignments[route as keyof typeof assignments] || 'Unassigned';
  }
  
  // Generate detailed prospect report
  private async generateProspectReport(prospect: BusinessProspect): Promise<void> {
    const reportPath = path.join(this.prospectsDir, `report_${prospect.sessionId}.md`);
    
    const report = `# Business Prospect Report
    
## Executive Summary
- **Prospect Type**: ${prospect.traderType.toUpperCase()}
- **Estimated Revenue**: $${prospect.estimatedRevenue.toLocaleString()}
- **Priority Level**: ${prospect.priority.toUpperCase()}
- **Conversion Probability**: ${prospect.conversionProbability}%

## Detection Details
- **Session ID**: ${prospect.sessionId}
- **Detection Time**: ${new Date(prospect.timestamp).toLocaleString()}
- **Business Value Score**: ${prospect.businessValueScore}/200
- **Risk Assessment**: ${prospect.riskAssessment}

## Technical Intelligence
- **IP Address**: ${prospect.ipAddress}
- **User Agent**: ${prospect.userAgent}
- **Detected Features**: ${prospect.detectedFeatures.join(', ')}
- **Suspicious Indicators**: ${prospect.indicators.join(', ')}

## Recommended Actions
${prospect.followUpActions.map(action => `- ${action}`).join('\n')}

## Contact Routing
- **Primary Route**: ${prospect.contactRoute.toUpperCase()}
- **Assigned Team**: ${this.getAssignedTeamMember(prospect.contactRoute)}

## Notes
This prospect was automatically identified through our security monitoring system. 
The high business value score indicates significant revenue potential. 
Immediate follow-up recommended given the ${prospect.priority} priority classification.

---
*Report generated by AlphaForge Business Intelligence System*
`;
    
    try {
      await fs.writeFile(reportPath, report, 'utf8');
      console.log('📊 Detailed prospect report generated');
    } catch (error) {
      console.error('Failed to generate prospect report:', error);
    }
  }
  
  // Specialized routing for high-value prospects
  private async executeSpecializedRouting(prospect: BusinessProspect): Promise<void> {
    if (prospect.priority === 'critical' && prospect.estimatedRevenue > 400000) {
      // Create executive briefing for mega-prospects
      await this.createExecutiveBriefing(prospect);
    }
    
    if (prospect.traderType === 'hedge_fund') {
      // Special handling for hedge fund prospects
      await this.createHedgeFundProposal(prospect);
    }
    
    // Log the routing action
    await enhancedLogger.logEvent('business_prospect_routed', {
      sessionId: prospect.sessionId,
      traderType: prospect.traderType,
      estimatedRevenue: prospect.estimatedRevenue,
      priority: prospect.priority,
      contactRoute: prospect.contactRoute
    }, {
      severity: prospect.priority === 'critical' ? 'high' : 'medium',
      businessValue: prospect.businessValueScore,
      sessionId: prospect.sessionId
    });
  }
  
  private async createExecutiveBriefing(prospect: BusinessProspect): Promise<void> {
    const briefingPath = path.join(this.prospectsDir, `executive_briefing_${prospect.sessionId}.md`);
    
    const briefing = `# EXECUTIVE BRIEFING - HIGH-VALUE PROSPECT
    
**PRIORITY: CRITICAL**
**ESTIMATED REVENUE: $${prospect.estimatedRevenue.toLocaleString()}**

## Situation
Our security monitoring system has identified a ${prospect.traderType} entity showing significant interest in our quantum trading platform. This represents a potentially transformative business opportunity.

## Opportunity Assessment
- **Business Value Score**: ${prospect.businessValueScore}/200
- **Conversion Probability**: ${prospect.conversionProbability}%
- **Competitive Advantage**: Early mover advantage in quantum trading space
- **Strategic Value**: Validates institutional market demand

## Immediate Actions Required
1. Executive team notification within 2 hours
2. Prepare custom enterprise demonstration
3. Research prospect's trading infrastructure requirements
4. Schedule C-level meeting within 48 hours

## Risk Factors
${prospect.riskAssessment}

---
*CONFIDENTIAL - Executive Team Only*
`;
    
    try {
      await fs.writeFile(briefingPath, briefing, 'utf8');
      console.log('🚨 Executive briefing created for critical prospect');
    } catch (error) {
      console.error('Failed to create executive briefing:', error);
    }
  }
  
  private async createHedgeFundProposal(prospect: BusinessProspect): Promise<void> {
    const proposalPath = path.join(this.prospectsDir, `hedge_fund_proposal_${prospect.sessionId}.md`);
    
    const proposal = `# Hedge Fund Partnership Proposal
    
## Overview
Proposal for strategic partnership with detected hedge fund entity.

## Quantum Trading Capabilities
- IBM Quantum, Google Cirq, Amazon Braket integration
- Proprietary VQE and QAOA algorithms
- Real-time portfolio optimization
- Risk management with quantum computing

## Partnership Benefits
- Exclusive access to cutting-edge quantum algorithms
- White-label quantum trading platform
- Custom algorithm development
- Regulatory compliance and security

## Revenue Model
- Performance-based fees: 25% of profits above benchmark
- Platform licensing: $50K/month
- Custom development: $200K/quarter

## Next Steps
1. Technical due diligence presentation
2. Proof of concept development
3. Pilot program initiation
4. Full platform deployment

---
*Prepared by AlphaForge Business Development*
`;
    
    try {
      await fs.writeFile(proposalPath, proposal, 'utf8');
      console.log('🎯 Hedge fund partnership proposal created');
    } catch (error) {
      console.error('Failed to create hedge fund proposal:', error);
    }
  }
  
  // Analytics and reporting
  public async generateBusinessIntelligenceReport(): Promise<any> {
    const csvPath = path.join(this.prospectsDir, 'business_prospects.csv');
    
    try {
      const csvContent = await fs.readFile(csvPath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      const prospects = lines.slice(1); // Skip header
      
      const report = {
        totalProspects: prospects.length,
        estimatedTotalRevenue: prospects.reduce((sum, line) => {
          const revenue = parseFloat(line.split(',')[4]?.replace(/"/g, '') || '0');
          return sum + revenue;
        }, 0),
        priorityDistribution: {
          critical: prospects.filter(p => p.includes('"critical"')).length,
          high: prospects.filter(p => p.includes('"high"')).length,
          medium: prospects.filter(p => p.includes('"medium"')).length,
          low: prospects.filter(p => p.includes('"low"')).length
        },
        traderTypeDistribution: {
          hedge_fund: prospects.filter(p => p.includes('"hedge_fund"')).length,
          prop_trading: prospects.filter(p => p.includes('"prop_trading"')).length,
          institutional: prospects.filter(p => p.includes('"institutional"')).length,
          enterprise: prospects.filter(p => p.includes('"enterprise"')).length,
          retail: prospects.filter(p => p.includes('"retail"')).length
        }
      };
      
      console.log('📊 Business Intelligence Report Generated:', report);
      return report;
    } catch (error) {
      console.error('Failed to generate BI report:', error);
      return null;
    }
  }
}

export const businessIntelligenceRouter = new BusinessIntelligenceRouter();