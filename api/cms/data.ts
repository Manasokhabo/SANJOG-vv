// Vercel Serverless Function: GET /api/cms/data

let globalCmsData: any = null;

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (globalCmsData) {
    return res.status(200).json({
      success: true,
      data: globalCmsData
    });
  }

  return res.status(200).json({
    success: false,
    message: 'No server CMS data found'
  });
}
