export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
export const WEB3FORMS_ACCESS_KEY = '9894a55f-f42e-4772-8927-7d7f29e3ecdc';

export type Web3FormCategory =
  | 'repair_booking'
  | 'sell_phone'
  | 'buy_phone'
  | 'contact_inquiry'
  | 'warranty_claim';

export interface Web3FormsSubmissionPayload {
  formType: Web3FormCategory;
  subject: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  brand?: string;
  model: string;
  problems: string;
  dynamicPricing: string;
  visitTokenAmount?: number;
  slotDate?: string;
  slotWindow?: string;
  area?: string;
  address?: string;
  referenceId?: string;
  paymentStatus?: string;
  paymentId?: string;
  paymentLink?: string;
  message?: string;
}

export interface Web3FormsResponse {
  success: boolean;
  message: string;
}

export function buildPaymentLinkUrl(referenceId: string, amount: number = 199): string {
  const cleanRef = encodeURIComponent(referenceId || `SST-${Date.now().toString().slice(-6)}`);
  return `https://rzp.io/l/sastafone-visit-fee?ref=${cleanRef}&amount=${amount}`;
}

export async function submitToWeb3Forms(
  data: Web3FormsSubmissionPayload
): Promise<Web3FormsResponse> {
  try {
    const cleanPhone = (data.phone || '').replace(/\D/g, '');
    const safeEmail =
      data.email && data.email.includes('@')
        ? data.email.trim()
        : `${cleanPhone || 'customer'}@sastafone.in`;

    const slotSummary = [data.slotDate, data.slotWindow, data.area].filter(Boolean).join(' | ') || 'Not specified';

    const formattedMessage = [
      `Service: ${data.service}`,
      `Device: ${[data.brand, data.model].filter(Boolean).join(' ')}`,
      `Problems / Issues: ${data.problems || 'General Checkup'}`,
      `Dynamic Pricing: ${data.dynamicPricing}`,
      data.visitTokenAmount !== undefined ? `Visit Token Required: Rs.${data.visitTokenAmount}` : null,
      `Pickup / Service Slot: ${slotSummary}`,
      data.area ? `Surat Area: ${data.area}` : null,
      data.address ? `Address: ${data.address}` : null,
      data.referenceId ? `Reference / Job ID: ${data.referenceId}` : null,
      `Payment Status: ${data.paymentStatus || 'Pending Payment Confirmation'}`,
      data.paymentId ? `Razorpay Payment ID: ${data.paymentId}` : null,
      data.paymentLink ? `Payment Link: ${data.paymentLink}` : null,
      data.message ? `Customer Note: ${data.message}` : null
    ]
      .filter(Boolean)
      .join('\n');

    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        from_name: 'Sastafone Surat Booking',
        subject: data.subject,
        form_type: data.formType,
        name: data.name || 'Surat Customer',
        email: safeEmail,
        phone: data.phone || '',
        service: data.service,
        brand: data.brand || '',
        model: data.model,
        problems: data.problems,
        dynamic_pricing: data.dynamicPricing,
        visit_token_amount: data.visitTokenAmount ?? 199,
        slot_date: data.slotDate || '',
        slot_window: data.slotWindow || '',
        area: data.area || '',
        address: data.address || '',
        reference_id: data.referenceId || '',
        payment_status: data.paymentStatus || 'Pending Payment Confirmation',
        razorpay_payment_id: data.paymentId || '',
        payment_link: data.paymentLink || '',
        message: formattedMessage
      })
    });

    const result = await response.json().catch(() => ({}));
    if (response.ok && result.success !== false) {
      return {
        success: true,
        message: result.message || 'Submission sent successfully'
      };
    }

    return {
      success: false,
      message: result.message || 'Web3Forms submission failed'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error while submitting to Web3Forms'
    };
  }
}
