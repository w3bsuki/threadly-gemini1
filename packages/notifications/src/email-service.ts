import { Resend } from 'resend';
import { database } from '@repo/database';
import type { NotificationPreferences } from '@repo/real-time';
import { OrderConfirmationEmail } from './templates/order-confirmation';
import { NewMessageEmail } from './templates/new-message';
import { PaymentReceivedEmail } from './templates/payment-received';
import { WeeklyReportEmail } from './templates/weekly-report';

export class EmailService {
  private resend: Resend;
  private fromEmail = 'notifications@threadly.com';

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  // Send order confirmation email
  async sendOrderConfirmation(order: any) {
    const buyer = await database.user.findUnique({
      where: { id: order.buyerId },
      select: { email: true, firstName: true, notificationPreferences: true },
    });

    if (!buyer?.email) return;

    const prefs = buyer.notificationPreferences as NotificationPreferences;
    if (!prefs?.email?.orderUpdates) return;

    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: buyer.email,
      subject: `Order Confirmed - #${order.id}`,
      react: OrderConfirmationEmail({
        orderId: order.id,
        buyerName: buyer.firstName || 'Customer',
        items: order.items,
        total: order.total,
        estimatedDelivery: order.estimatedDelivery,
      }),
    });

    if (error) {
      console.error('Failed to send order confirmation email:', error);
    }

    return data;
  }

  // Send new message notification
  async sendNewMessageNotification(message: any, conversation: any) {
    const recipientId = message.senderId === conversation.buyerId 
      ? conversation.sellerId 
      : conversation.buyerId;

    const [recipient, sender] = await Promise.all([
      database.user.findUnique({
        where: { id: recipientId },
        select: { email: true, firstName: true, notificationPreferences: true },
      }),
      database.user.findUnique({
        where: { id: message.senderId },
        select: { firstName: true, lastName: true },
      }),
    ]);

    if (!recipient?.email) return;

    const prefs = recipient.notificationPreferences as NotificationPreferences;
    if (!prefs?.email?.newMessages) return;

    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: recipient.email,
      subject: `New message from ${sender?.firstName}`,
      react: NewMessageEmail({
        recipientName: recipient.firstName || 'User',
        senderName: `${sender?.firstName} ${sender?.lastName}`.trim(),
        messagePreview: message.content.substring(0, 100),
        conversationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.threadly.com'}/messages/${conversation.id}`,
      }),
    });

    if (error) {
      // TODO: Add proper error tracking service and retry mechanism
    }

    return data;
  }

  // Send payment received notification
  async sendPaymentReceived(payment: any, order: any) {
    const seller = await database.user.findUnique({
      where: { id: order.sellerId },
      select: { email: true, firstName: true, notificationPreferences: true },
    });

    if (!seller?.email) return;

    const prefs = seller.notificationPreferences as NotificationPreferences;
    if (!prefs?.email?.paymentReceived) return;

    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: seller.email,
      subject: `Payment Received - ${payment.amount}`,
      react: PaymentReceivedEmail({
        sellerName: seller.firstName || 'Seller',
        amount: payment.amount,
        orderId: order.id,
        productName: order.items[0]?.product?.title || 'Product',
        payoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }),
    });

    if (error) {
      console.error('Failed to send payment received email:', error);
    }

    return data;
  }

  // Send weekly seller report
  async sendWeeklyReport(sellerId: string, reportData: any) {
    const seller = await database.user.findUnique({
      where: { id: sellerId },
      select: { email: true, firstName: true, notificationPreferences: true },
    });

    if (!seller?.email) return;

    const prefs = seller.notificationPreferences as NotificationPreferences;
    if (!prefs?.email?.weeklyReport) return;

    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: seller.email,
      subject: 'Your Weekly Threadly Report',
      react: WeeklyReportEmail({
        sellerName: seller.firstName || 'Seller',
        weekStartDate: reportData.weekStartDate,
        weekEndDate: reportData.weekEndDate,
        totalSales: reportData.totalSales,
        totalRevenue: reportData.totalRevenue,
        totalViews: reportData.totalViews,
        totalMessages: reportData.totalMessages,
        topProducts: reportData.topProducts,
      }),
    });

    if (error) {
      console.error('Failed to send weekly report email:', error);
    }

    return data;
  }

  // Send bulk emails (for marketing campaigns)
  async sendBulkEmail(recipients: string[], subject: string, content: React.ReactElement) {
    const emails = recipients.map(to => ({
      from: this.fromEmail,
      to,
      subject,
      react: content,
    }));

    const { data, error } = await this.resend.batch.send(emails);

    if (error) {
      console.error('Failed to send bulk emails:', error);
    }

    return data;
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(apiKey?: string): EmailService {
  if (!emailService && apiKey) {
    emailService = new EmailService(apiKey);
  }
  
  if (!emailService) {
    throw new Error('EmailService not initialized. Provide API key first.');
  }
  
  return emailService;
}