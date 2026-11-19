declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export type GaEventName =
  | 'page_view'
  | 'book_repair_start'
  | 'repair_service_selected'
  | 'visit_fee_initiated'
  | 'visit_fee_paid'
  | 'visit_fee_failed'
  | 'sell_phone_submitted'
  | 'buy_phone_token_initiated'
  | 'buy_phone_reserved'
  | 'quote_approved'
  | 'quote_declined'
  | 'review_submitted'
  | 'whatsapp_click'
  | 'call_click'
  | 'google_maps_click'
  | 'google_review_click'
  | 'warranty_lookup'
  | 'order_status_lookup';

export function trackEvent(eventName: GaEventName, params: Record<string, any> = {}): void {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...params,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  } catch {
    // Non-blocking analytics guard
  }
}
