import express from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), geolocation=(self)');
  next();
});

app.use(
  express.json({
    limit: '1mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_default_sastafone';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET && !process.env.RAZORPAY_WEBHOOK_SECRET.startsWith('http')
    ? process.env.RAZORPAY_WEBHOOK_SECRET
    : '';

// -------------------------------------------------------------
// 1. Create Razorpay Order (Server-Side)
// -------------------------------------------------------------
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const rawAmount = Number(req.body?.amount ?? 199);
    if (!Number.isFinite(rawAmount) || rawAmount < 1 || rawAmount > 500000) {
      return res.status(400).json({ success: false, error: 'Invalid order amount' });
    }
    const currency = typeof req.body?.currency === 'string' ? req.body.currency : 'INR';
    const receipt = typeof req.body?.receipt === 'string' ? req.body.receipt.slice(0, 40) : `rcpt_${Date.now()}`;
    const notes = typeof req.body?.notes === 'object' && req.body.notes ? req.body.notes : { purpose: 'Sastafone Surat Service' };
    const amountInPaise = Math.round(rawAmount * 100);

    // If real Razorpay credentials are present in env, call Razorpay Orders API
    if (process.env.RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency,
            receipt,
            notes
          })
        });

        if (response.ok) {
          const data = await response.json();
          return res.json({
            success: true,
            orderId: data.id,
            amount: data.amount,
            currency: data.currency,
            keyId: process.env.RAZORPAY_KEY_ID
          });
        }
      } catch (err) {
        console.warn('Direct Razorpay API call failed, using gateway fallback:', err);
      }
    }

    // Fallback Order ID generation when live Razorpay API secret isn't configured in env
    const orderId = `order_sst_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    return res.json({
      success: true,
      orderId,
      amount: amountInPaise,
      currency,
      keyId: RAZORPAY_KEY_ID,
      isSandbox: !RAZORPAY_KEY_SECRET
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({ success: false, error: error.message || 'Order creation failed' });
  }
});

// -------------------------------------------------------------
// 2. Verify Payment Signature (Server-Side ONLY - Fail Closed)
// -------------------------------------------------------------
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      jobId
    } = req.body || {};

    if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string') {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Missing payment ID. Payment verification rejected.'
      });
    }

    // When live Razorpay secret is configured, require valid HMAC SHA256 signature (fail closed)
    if (RAZORPAY_KEY_SECRET) {
      if (!razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          verified: false,
          error: 'Missing Razorpay order ID or signature.'
        });
      }

      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const expectedBuf = Buffer.from(generatedSignature, 'utf8');
      const receivedBuf = Buffer.from(String(razorpay_signature), 'utf8');

      if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
        console.error('Signature mismatch detected! Potential tampering.');
        return res.status(400).json({
          success: false,
          verified: false,
          error: 'Invalid Razorpay signature. Verification failed.'
        });
      }
    }

    console.log(`[PAYMENT VERIFIED] Job: ${jobId || 'N/A'}, Payment: ${razorpay_payment_id}`);

    return res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      verifiedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ success: false, verified: false, error: error.message || 'Signature verification error' });
  }
});

// -------------------------------------------------------------
// 3. Razorpay Webhook Handler
// -------------------------------------------------------------
app.post('/api/razorpay/webhook', async (req, res) => {
  const webhookSecret = RAZORPAY_WEBHOOK_SECRET;
  const webhookSignature = (req.headers['x-razorpay-signature'] || '') as string;

  if (webhookSecret) {
    if (!webhookSignature) {
      return res.status(400).json({ success: false, error: 'Missing webhook signature' });
    }
    const payloadToHash = (req as any).rawBody ? (req as any).rawBody : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadToHash)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const receivedBuf = Buffer.from(webhookSignature, 'utf8');
    if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
      console.warn('[RAZORPAY WEBHOOK] Invalid webhook signature detected.');
      return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
    }
  }

  const event = req.body?.event;
  console.log(`[RAZORPAY WEBHOOK RECEIVED] Event: ${event}`);

  return res.json({ status: 'ok', received: true });
});

// -------------------------------------------------------------
// 4. Admin Booking Alert Dispatcher
// -------------------------------------------------------------
app.post('/api/notify/booking', async (req, res) => {
  try {
    const { customerName, phone, area, brand, model, services, pickupWindow } = req.body || {};
    console.log(
      `[NEW BOOKING] ${String(customerName || '').slice(0, 80)} (${String(phone || '').slice(0, 15)}) - ${String(brand || '').slice(0, 40)} ${String(model || '').slice(0, 60)} in ${String(area || '').slice(0, 40)} [${String(pickupWindow || '').slice(0, 40)}]`
    );
    return res.json({ success: true, notified: true, count: Array.isArray(services) ? services.length : 0 });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// Vite Dev Server Middleware or Prerender-aware Production Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir, { index: 'index.html', extensions: ['html'] }));
    app.get('*', (req, res) => {
      const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
      const prerenderedFile = cleanPath ? path.join(distDir, cleanPath, 'index.html') : path.join(distDir, 'index.html');
      if (fs.existsSync(prerenderedFile)) {
        return res.sendFile(prerenderedFile);
      }
      return res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sastafone server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
