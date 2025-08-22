/*
 * AlphaForge - WhatsApp Webhook Configuration
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * WhatsApp Business API webhook setup and testing endpoints.
 * Unauthorized access, copying, or distribution is strictly prohibited.
 */

import { Router } from 'express';
import { advancedWebhookServices } from '../alerting/webhookServices';
import { enhancedLogger } from '../alerting/logger';

const router = Router();

// WhatsApp webhook verification (required by Meta)
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  // Verify token should match your configured verify token
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'alphaforge_webhook_verify';
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('❌ WhatsApp webhook verification failed');
    res.sendStatus(403);
  }
});

// WhatsApp webhook endpoint for receiving messages (optional)
router.post('/whatsapp', async (req, res) => {
  try {
    const body = req.body;
    
    if (body.object === 'whatsapp_business_account') {
      // Process incoming WhatsApp messages if needed
      console.log('📱 WhatsApp webhook received:', JSON.stringify(body, null, 2));
      
      // Log webhook activity
      await enhancedLogger.logEvent('whatsapp_webhook_received', {
        message: 'WhatsApp webhook activity',
        payload: body
      }, {
        severity: 'low'
      });
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Test WhatsApp integration
router.post('/test-whatsapp', async (req, res) => {
  try {
    const { message = 'Test message from AlphaForge admin panel' } = req.body;
    
    await advancedWebhookServices.sendAdvancedAlert({
      title: '🧪 WhatsApp Test Alert',
      message,
      severity: 'medium',
      metadata: {
        source: 'admin_test',
        timestamp: new Date().toISOString()
      }
    });
    
    res.json({
      success: true,
      message: 'WhatsApp test alert sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'WhatsApp test failed - check configuration'
    });
  }
});

// Check WhatsApp configuration status
router.get('/whatsapp-status', (req, res) => {
  const config = {
    accessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
    recipientNumber: !!process.env.WHATSAPP_RECIPIENT_NUMBER,
    verifyToken: !!process.env.WHATSAPP_VERIFY_TOKEN
  };
  
  const isConfigured = config.accessToken && config.phoneNumberId && config.recipientNumber;
  
  res.json({
    success: true,
    configured: isConfigured,
    config,
    webhookUrl: `${req.protocol}://${req.get('host')}/api/webhooks/whatsapp`,
    setupInstructions: {
      step1: 'Get WhatsApp Business API access token from Meta for Developers',
      step2: 'Set WHATSAPP_ACCESS_TOKEN environment variable',
      step3: 'Set WHATSAPP_PHONE_NUMBER_ID environment variable',
      step4: 'Set WHATSAPP_RECIPIENT_NUMBER environment variable (your phone)',
      step5: 'Configure webhook URL in Meta Developer Console',
      step6: 'Test integration using /api/webhooks/test-whatsapp'
    }
  });
});

// Generate WhatsApp setup instructions
router.get('/whatsapp-setup', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.json({
    success: true,
    setupGuide: {
      title: 'WhatsApp Business API Setup for AlphaForge',
      steps: [
        {
          step: 1,
          title: 'Create Meta Developer Account',
          description: 'Visit developers.facebook.com and create an app',
          url: 'https://developers.facebook.com/'
        },
        {
          step: 2,
          title: 'Add WhatsApp Business API',
          description: 'Add WhatsApp Business API product to your app',
          note: 'This provides 1,000 free conversations per month'
        },
        {
          step: 3,
          title: 'Get Access Token',
          description: 'Generate permanent access token from your app dashboard',
          envVar: 'WHATSAPP_ACCESS_TOKEN'
        },
        {
          step: 4,
          title: 'Get Phone Number ID',
          description: 'Copy your WhatsApp Business phone number ID',
          envVar: 'WHATSAPP_PHONE_NUMBER_ID'
        },
        {
          step: 5,
          title: 'Set Recipient Number',
          description: 'Your executive phone number for alerts (include country code)',
          envVar: 'WHATSAPP_RECIPIENT_NUMBER',
          example: '+1234567890'
        },
        {
          step: 6,
          title: 'Configure Webhook',
          description: 'Set webhook URL in Meta Developer Console',
          webhookUrl: `${baseUrl}/api/webhooks/whatsapp`,
          verifyToken: 'alphaforge_webhook_verify'
        },
        {
          step: 7,
          title: 'Test Integration',
          description: 'Send test alert to verify setup',
          testUrl: `${baseUrl}/api/webhooks/test-whatsapp`
        }
      ],
      environmentVariables: {
        WHATSAPP_ACCESS_TOKEN: 'Your permanent access token from Meta',
        WHATSAPP_PHONE_NUMBER_ID: 'Your WhatsApp Business phone number ID',
        WHATSAPP_RECIPIENT_NUMBER: 'Executive phone number (+1234567890)',
        WHATSAPP_VERIFY_TOKEN: 'alphaforge_webhook_verify'
      },
      alertTypes: [
        'Critical hedge fund detections (immediate)',
        'High-value business prospects (>$400K)',
        'System security incidents (risk score >150)',
        'Daily compliance summaries (6 AM)',
        'Weekly board reports (Monday 8 AM)'
      ]
    }
  });
});

export { router as webhookRoutes };