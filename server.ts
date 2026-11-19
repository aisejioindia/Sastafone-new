import express from 'express';
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

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// -------------------------------------------------------------
// Booking Alert Dispatcher (No Third-Party Payment Gateway)
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
