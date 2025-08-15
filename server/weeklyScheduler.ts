// AlphaForge Weekly Scheduler
// Manages weekly performance report scheduling and delivery

import { emailService } from './emailService.js';

export class WeeklyScheduler {
  private static instance: WeeklyScheduler;
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();
  private recipients: string[] = ['emekabron@outlook.com'];
  private isRunning: boolean = false;

  public static getInstance(): WeeklyScheduler {
    if (!WeeklyScheduler.instance) {
      WeeklyScheduler.instance = new WeeklyScheduler();
    }
    return WeeklyScheduler.instance;
  }

  startWeeklyReports(): void {
    if (this.isRunning) {
      console.log('📅 Weekly scheduler already running');
      return;
    }

    this.isRunning = true;
    console.log('📅 Starting weekly performance report scheduler...');

    // Calculate next Monday at 9 AM
    const now = new Date();
    const nextMonday = this.getNextMonday(now);
    nextMonday.setHours(9, 0, 0, 0); // 9:00 AM

    // If it's already past Monday 9 AM this week, schedule for next week
    if (now.getTime() > nextMonday.getTime()) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }

    const timeUntilNextReport = nextMonday.getTime() - now.getTime();

    console.log(`📧 Next weekly report scheduled for: ${nextMonday.toLocaleString()}`);
    console.log(`⏰ Time until next report: ${this.formatTimeUntil(timeUntilNextReport)}`);

    // Schedule the first report
    const initialTimeout = setTimeout(() => {
      this.sendWeeklyReportsToAll();
      this.scheduleRecurringReports();
    }, timeUntilNextReport);

    this.scheduledJobs.set('initial', initialTimeout);

    // Also send a test report immediately if requested
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Development mode - sending immediate test report...');
      setTimeout(() => this.sendWeeklyReportsToAll(), 5000); // Wait 5 seconds for server to fully start
    }
  }

  private scheduleRecurringReports(): void {
    // Schedule recurring weekly reports (every Monday at 9 AM)
    const weeklyInterval = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    const recurringInterval = setInterval(() => {
      this.sendWeeklyReportsToAll();
    }, weeklyInterval);

    this.scheduledJobs.set('recurring', recurringInterval);
    console.log('📅 Recurring weekly reports scheduled (every Monday at 9 AM)');
  }

  private async sendWeeklyReportsToAll(): Promise<void> {
    console.log('\n📊 Generating and sending weekly performance reports...');
    
    const emailStatus = emailService.getConfigurationStatus();
    console.log(`📧 Email service status: ${emailStatus.message}`);

    for (const recipient of this.recipients) {
      try {
        const success = await emailService.sendWeeklyReport(recipient);
        if (success) {
          console.log(`✅ Weekly report sent to ${recipient}`);
        } else {
          console.log(`❌ Failed to send report to ${recipient}`);
        }
      } catch (error) {
        console.error(`❌ Error sending report to ${recipient}:`, error);
      }
    }

    console.log('📊 Weekly report cycle completed\n');
  }

  addRecipient(email: string): void {
    if (!this.recipients.includes(email)) {
      this.recipients.push(email);
      console.log(`📧 Added ${email} to weekly report recipients`);
    } else {
      console.log(`📧 ${email} is already in recipient list`);
    }
  }

  removeRecipient(email: string): void {
    const index = this.recipients.indexOf(email);
    if (index > -1) {
      this.recipients.splice(index, 1);
      console.log(`📧 Removed ${email} from weekly report recipients`);
    } else {
      console.log(`📧 ${email} not found in recipient list`);
    }
  }

  getRecipients(): string[] {
    return [...this.recipients];
  }

  async sendImmediateReport(recipient?: string): Promise<boolean> {
    const targetRecipient = recipient || this.recipients[0];
    console.log(`📧 Sending immediate report to ${targetRecipient}...`);
    
    try {
      const success = await emailService.sendWeeklyReport(targetRecipient);
      return success;
    } catch (error) {
      console.error('❌ Failed to send immediate report:', error);
      return false;
    }
  }

  async testEmailService(): Promise<boolean> {
    console.log('🧪 Testing email service configuration...');
    
    try {
      const success = await emailService.sendTestEmail(this.recipients[0]);
      return success;
    } catch (error) {
      console.error('❌ Email service test failed:', error);
      return false;
    }
  }

  stopScheduler(): void {
    console.log('🛑 Stopping weekly scheduler...');
    
    this.scheduledJobs.forEach((job, name) => {
      clearTimeout(job as NodeJS.Timeout);
      clearInterval(job as NodeJS.Timeout);
      console.log(`🛑 Stopped job: ${name}`);
    });
    
    this.scheduledJobs.clear();
    this.isRunning = false;
    console.log('🛑 Weekly scheduler stopped');
  }

  getStatus(): {
    isRunning: boolean;
    recipients: string[];
    nextReportTime: string;
    emailServiceConfigured: boolean;
  } {
    const now = new Date();
    const nextMonday = this.getNextMonday(now);
    nextMonday.setHours(9, 0, 0, 0);
    
    if (now.getTime() > nextMonday.getTime()) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }

    const emailStatus = emailService.getConfigurationStatus();

    return {
      isRunning: this.isRunning,
      recipients: this.getRecipients(),
      nextReportTime: nextMonday.toLocaleString(),
      emailServiceConfigured: emailStatus.isConfigured
    };
  }

  private getNextMonday(date: Date): Date {
    const day = date.getDay();
    const daysUntilMonday = (1 - day + 7) % 7;
    const nextMonday = new Date(date);
    nextMonday.setDate(date.getDate() + daysUntilMonday);
    return nextMonday;
  }

  private formatTimeUntil(milliseconds: number): string {
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
    const hours = Math.floor((milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  }
}

export const weeklyScheduler = WeeklyScheduler.getInstance();