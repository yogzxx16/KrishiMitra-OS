import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') }); // Fallback to root if needed

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const DATA_GOV_RESOURCE_ID = process.env.DATA_GOV_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';

app.use(cors());
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'KrishiMitra Market Proxy is running' });
});

// ─── Mandi Prices Proxy ───────────────────────────────────────────────────────

app.get('/api/mandi-prices', async (req, res) => {
  if (!DATA_GOV_API_KEY) {
    return res.status(500).json({
      success: false,
      message: 'DATA_GOV_API_KEY is not configured on the server.',
      data: []
    });
  }

  const { state, district, commodity, limit = '100' } = req.query;

  try {
    const url = new URL(`https://api.data.gov.in/resource/${DATA_GOV_RESOURCE_ID}`);
    url.searchParams.set('api-key', DATA_GOV_API_KEY);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', String(limit));

    // Optional filters based on Agmarknet API structure
    if (state) {
      url.searchParams.set('filters[state]', String(state));
    }
    if (district) {
      url.searchParams.set('filters[district]', String(district));
    }
    if (commodity) {
      url.searchParams.set('filters[commodity]', String(commodity));
    }

    const response = await axios.get(url.toString(), {
      timeout: 8000 // 8s timeout
    });

    const data = response.data;

    res.json({
      success: true,
      count: data.count || data.records?.length || 0,
      data: data.records || []
    });

  } catch (error) {
    console.error('Error fetching mandi prices from data.gov.in:', error.message);
    res.status(502).json({
      success: false,
      message: 'Failed to fetch prices from Agmarknet API.',
      error: error.message,
      data: []
    });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[KrishiMitra Backend] Proxy server running on http://localhost:${PORT}`);
  if (!DATA_GOV_API_KEY) {
    console.warn('⚠️ WARNING: DATA_GOV_API_KEY is not set. Mandi API endpoint will return errors.');
  }
});
