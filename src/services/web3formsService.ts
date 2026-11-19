import { DIRECT_UPI_ID, buildUpiPaymentUri } from './paymentService';

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
  return buildUpiPaymentUri(referenceId, amount);
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
    const resolvedPaymentLink =
      data.paymentLink ||
      (data.referenceId && (data.visitTokenAmount ?? 0) > 0
        ? buildUpiPaymentUri(data.referenceId, data.visitTokenAmount)
        : '');

    const formattedMessage = [
      `Service: ${data.service}`,
      `Device: ${[data.brand, data.model].filter(Boolean).join(' ')}`,
      `Problems / Issues: ${data.problems || 'General Checkup'}`,
      `Dynamic Pricing: ${data.dynamicPricing}`,
      data.visitTokenAmount !== undefined ? `Visit Token Required: Rs.${data.visitTokenAmount}` : null,
      `Direct UPI ID: ${DIRECT_UPI_ID}`,
      `Pickup / Service Slot: ${slotSummary}`,
      data.area ? `Surat Area: ${data.area}` : null,
      data.address ? `Address: ${data.address}` : null,
      data.referenceId ? `Reference / Job ID: ${data.referenceId}` : null,
      `Payment Status: ${data.paymentStatus || 'Pending Direct UPI Confirmation'}`,
      data.paymentId ? `UPI UTR / Ref ID: ${data.paymentId}` : null,
      resolvedPaymentLink ? `Direct UPI URI: ${resolvedPaymentLink}` : null,
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
        from_name: 'Sastafone Surat WhatsApp Booking',
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
        upi_id: DIRECT_UPI_ID,
        slot_date: data.slotDate || '',
        slot_window: data.slotWindow || '',
        area: data.area || '',
        address: data.address || '',
        reference_id: data.referenceId || '',
        payment_status: data.paymentStatus || 'Pending Direct UPI Confirmation',
        upi_utr_or_ref: data.paymentId || '',
        upi_payment_uri: resolvedPaymentLink,
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
