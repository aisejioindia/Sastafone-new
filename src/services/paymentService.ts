/**
 * Sastafone Surat - Direct UPI Payment Helpers (9372802044@idfcfirst)
 * No third-party payment gateway or login required.
 */

export const DIRECT_UPI_ID = '9372802044@idfcfirst';
export const DIRECT_UPI_PAYEE_NAME = 'Sastafone Surat';

export function buildUpiPaymentUri(
  referenceId: string,
  amount: number = 199,
  note?: string
): string {
  const cleanRef = referenceId || `SST-${Date.now().toString().slice(-6)}`;
  const txnNote = note || `Sastafone ${cleanRef}`;
  const params = new URLSearchParams({
    pa: DIRECT_UPI_ID,
    pn: DIRECT_UPI_PAYEE_NAME,
    am: String(amount),
    cu: 'INR',
    tn: txnNote
  });
  return `upi://pay?${params.toString()}`;
}

export const PAYMENT_TIERS: Record<string, any> = {
  repair_visit: {
    id: 'repair_visit',
    amount: 199,
    title: 'सूरत डोरस्टेप पिकअप व QC विज़िट टोकन',
    subtitle: 'फाइनल बिल में 100% एडजस्टेबल (UPI: 9372802044@idfcfirst)',
    benefits: ['60 मिनट स्लॉट पिकअप', '11-पॉइंट QC इंस्पेक्शन', 'ओरिजिनल पार्ट्स वारंटी']
  },
  appointment_199: {
    id: 'appointment_199',
    amount: 199,
    title: 'सूरत डोरस्टेप पिकअप व QC विज़िट टोकन',
    subtitle: 'फाइनल बिल में 100% एडजस्टेड (UPI: 9372802044@idfcfirst)',
    benefits: ['डोरस्टेप पिकअप स्लॉट', '11-पॉइंट QC इंस्पेक्शन', '₹1000+ बिल पर 6 माह वारंटी']
  }
};

export function createPaymentOrderItem(tier: any, user: any, locality?: string): any {
  return {
    orderNumber: `SF-${Date.now().toString().slice(-6)}`,
    type: 'repair',
    title: tier.title || 'रिपेयर विज़िट टोकन',
    subtitle: tier.subtitle || 'सूरत डोरस्टेप',
    amount: tier.amount || 199,
    status: 'booked',
    statusHindi: 'टोकन अनुरोध दर्ज',
    locality: locality || 'Adajan, Surat',
    fullAddress: user?.address || 'Surat, Gujarat',
    customerName: user?.name || 'Surat Customer',
    customerPhone: user?.phone || '',
    timeSlot: 'Today',
    paymentStatus: 'pending'
  };
}
