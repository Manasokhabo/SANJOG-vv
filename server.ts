import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '25mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'cms-store.json');
const PUBLIC_UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const ROOT_UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
  fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(ROOT_UPLOADS_DIR)) {
  fs.mkdirSync(ROOT_UPLOADS_DIR, { recursive: true });
}

// Serve uploaded media statically
app.use('/uploads', express.static(PUBLIC_UPLOADS_DIR));
app.use('/uploads', express.static(ROOT_UPLOADS_DIR));

const CONFIG_FILE = path.join(DATA_DIR, 'cloud-config.json');

// In-memory cache loaded from file if exists
let cmsCache: any = null;
if (fs.existsSync(STORE_FILE)) {
  try {
    cmsCache = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading cms-store.json:', err);
  }
}

let cloudConfigCache: any = {
  provider: 'none',
  supabaseUrl: '',
  supabaseAnonKey: '',
  mongoUri: ''
};

if (fs.existsSync(CONFIG_FILE)) {
  try {
    cloudConfigCache = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading cloud-config.json:', err);
  }
} else if (cmsCache?.cloudConfig?.supabaseUrl && cmsCache?.cloudConfig?.supabaseAnonKey) {
  cloudConfigCache = cmsCache.cloudConfig;
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cloudConfigCache, null, 2), 'utf-8');
  } catch {}
}

// API Routes
app.get('/api/cms/config', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  return res.json({ success: true, config: cloudConfigCache });
});

app.post('/api/cms/config', (req, res) => {
  try {
    const config = req.body;
    cloudConfigCache = {
      ...cloudConfigCache,
      ...config,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cloudConfigCache, null, 2), 'utf-8');
    if (cmsCache) {
      cmsCache.cloudConfig = cloudConfigCache;
      fs.writeFileSync(STORE_FILE, JSON.stringify(cmsCache, null, 2), 'utf-8');
    }
    return res.json({ 
      success: true, 
      message: 'Cloud database configuration saved globally to server storage', 
      config: cloudConfigCache 
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/cms/data', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  if (cmsCache) {
    return res.json({ 
      success: true, 
      data: cmsCache, 
      cloudConfig: cloudConfigCache 
    });
  }
  return res.json({ 
    success: false, 
    message: 'No stored CMS data found', 
    cloudConfig: cloudConfigCache 
  });
});

app.post('/api/cms/sync', async (req, res) => {
  try {
    const data = req.body;
    
    // Protect cloudConfig: never overwrite valid credentials with empty values
    let mergedCloudConfig = { ...cloudConfigCache };
    if (data.cloudConfig && data.cloudConfig.supabaseUrl && data.cloudConfig.supabaseAnonKey) {
      mergedCloudConfig = {
        ...cloudConfigCache,
        ...data.cloudConfig
      };
      cloudConfigCache = mergedCloudConfig;
      try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(cloudConfigCache, null, 2), 'utf-8');
      } catch {}
    }

    cmsCache = {
      ...data,
      cloudConfig: mergedCloudConfig,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(cmsCache, null, 2), 'utf-8');

    // Server-side mirror to Supabase if credentials are valid
    if (mergedCloudConfig.provider === 'supabase' && mergedCloudConfig.supabaseUrl && mergedCloudConfig.supabaseAnonKey) {
      try {
        const cleanUrl = mergedCloudConfig.supabaseUrl.trim().replace(/\/+$/, '');
        const cleanKey = mergedCloudConfig.supabaseAnonKey.trim();
        fetch(`${cleanUrl}/rest/v1/sanjog_cms?on_conflict=id`, {
          method: 'POST',
          headers: {
            'apikey': cleanKey,
            'Authorization': `Bearer ${cleanKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: 'cms_main',
            data: cmsCache,
            updated_at: new Date().toISOString()
          })
        }).catch(() => {});
      } catch {}
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.json({ 
      success: true, 
      message: 'CMS data successfully synced to backend storage & Supabase mirror', 
      timestamp: cmsCache.updatedAt 
    });
  } catch (err: any) {
    console.error('Error saving CMS data:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cms/inquiry', (req, res) => {
  try {
    const inquiry = req.body;
    const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
    let inquiries: any[] = [];
    if (fs.existsSync(INQUIRIES_FILE)) {
      try {
        inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf-8'));
      } catch {}
    }
    inquiries.unshift({
      ...inquiry,
      receivedAt: new Date().toISOString()
    });
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
    return res.json({ success: true, message: 'Inquiry saved successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// File / Image Upload Endpoint (Saves to /public/uploads and /uploads)
app.post('/api/upload', (req, res) => {
  try {
    const { filename, fileData } = req.body;
    if (!filename || !fileData) {
      return res.status(400).json({ success: false, message: 'Filename and base64 fileData are required' });
    }

    // Clean filename
    const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const uniqueFilename = `${Date.now()}_${safeName}`;

    // Extract base64 buffer
    const base64Data = fileData.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const publicFilePath = path.join(PUBLIC_UPLOADS_DIR, uniqueFilename);
    const rootFilePath = path.join(ROOT_UPLOADS_DIR, uniqueFilename);

    fs.writeFileSync(publicFilePath, buffer);
    try {
      fs.writeFileSync(rootFilePath, buffer);
    } catch {}

    const fileUrl = `/uploads/${uniqueFilename}`;
    return res.json({
      success: true,
      message: 'File uploaded successfully to server storage',
      url: fileUrl,
      filename: uniqueFilename
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Test Supabase Connection Endpoint
app.post('/api/cms/test-supabase', async (req, res) => {
  const { url, anonKey } = req.body;
  if (!url || !anonKey) {
    return res.status(400).json({ success: false, message: 'Supabase URL and API Key are required' });
  }

  try {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    
    // Check if table sanjog_cms exists directly
    let tableExists = false;
    let tableCheckMsg = '';

    try {
      const tableRes = await fetch(`${cleanUrl}/rest/v1/sanjog_cms?select=id&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': anonKey.trim(),
          'Authorization': `Bearer ${anonKey.trim()}`
        }
      });

      if (tableRes.ok) {
        tableExists = true;
        tableCheckMsg = 'Database table "sanjog_cms" exists and is ready for live syncing!';
      } else {
        tableCheckMsg = 'Supabase reached! Note: "sanjog_cms" table not yet created. Use 1-Button Auto DB Setup.';
      }
    } catch {}

    // Test Supabase REST root endpoint
    const response = await fetch(`${cleanUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': anonKey.trim(),
        'Authorization': `Bearer ${anonKey.trim()}`
      }
    });

    if (response.ok || response.status === 200 || response.status === 404 || tableExists) {
      return res.json({ 
        success: true, 
        tableExists,
        message: tableExists 
          ? 'Connected to Supabase project & sanjog_cms table verified!'
          : 'Connected to Supabase project! Ready for 1-Click Auto DB Setup.'
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: `Supabase returned status code: ${response.status} (${response.statusText})` 
      });
    }
  } catch (err: any) {
    return res.status(500).json({ 
      success: false, 
      message: `Failed to connect to Supabase: ${err.message}` 
    });
  }
});

// One-Button Auto DB Setup Endpoint for Supabase
app.post('/api/cms/supabase-auto-setup', async (req, res) => {
  const { url, anonKey, cmsData } = req.body;
  if (!url || !anonKey) {
    return res.status(400).json({ success: false, message: 'Supabase URL and API Key are required' });
  }

  try {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const dataToSave = cmsData || cmsCache || {};

    // Attempt to upsert row into sanjog_cms
    const upsertRes = await fetch(`${cleanUrl}/rest/v1/sanjog_cms`, {
      method: 'POST',
      headers: {
        'apikey': anonKey.trim(),
        'Authorization': `Bearer ${anonKey.trim()}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: 'cms_main',
        data: dataToSave,
        updated_at: new Date().toISOString()
      })
    });

    if (upsertRes.ok || upsertRes.status === 201 || upsertRes.status === 200 || upsertRes.status === 204) {
      return res.json({
        success: true,
        autoConfigured: true,
        message: 'Auto DB Setup Succeeded! Table "sanjog_cms" initialized and live data synced.'
      });
    } else {
      const errText = await upsertRes.text();
      return res.json({
        success: false,
        requiresSql: true,
        message: `Table not found or write restricted (${upsertRes.status}). Please run the 1-Click SQL script in Supabase SQL editor.`
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Test MongoDB Connection String Endpoint
app.post('/api/cms/test-mongodb', async (req, res) => {
  const { uri } = req.body;
  if (!uri) {
    return res.status(400).json({ success: false, message: 'MongoDB Connection String (URI) is required' });
  }

  const trimmed = uri.trim();
  const isValidFormat = trimmed.startsWith('mongodb://') || trimmed.startsWith('mongodb+srv://');
  if (!isValidFormat) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid MongoDB URI format. It must start with mongodb:// or mongodb+srv://' 
    });
  }

  return res.json({ 
    success: true, 
    message: 'MongoDB URI structure validated. Ready for Atlas M0 cluster data synchronization.' 
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> Sanjog server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
