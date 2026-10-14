// Vercel Serverless Function: POST /api/cms/sync

let globalCmsData: any = null;

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      globalCmsData = {
        ...data,
        syncedAt: new Date().toISOString()
      };
      return res.status(200).json({
        success: true,
        message: 'CMS data synchronized successfully on edge server'
      });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Sync endpoint ready'
  });
}
