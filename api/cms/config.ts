// Vercel Serverless Function: GET & POST /api/cms/config

let globalConfig = {
  provider: 'supabase',
  supabaseUrl: 'https://xivosnuqyfnpvmapymfq.supabase.co',
  supabaseAnonKey: '',
  mongoUri: '',
  lastSyncedAt: new Date().toISOString()
};

export default function handler(req: any, res: any) {
  // CORS & Cache headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      globalConfig = {
        ...globalConfig,
        ...body,
        updatedAt: new Date().toISOString()
      };
      return res.status(200).json({
        success: true,
        message: 'Cloud database configuration saved',
        config: globalConfig
      });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(200).json({
    success: true,
    config: globalConfig
  });
}
