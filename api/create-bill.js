export default async function handler(req, res) {
  const AUTH_TOKEN = Buffer.from(`${process.env.BILLPLZ_API_KEY}:`).toString('base64');
  const API_URL = process.env.BILLPLZ_ENDPOINT || 'https://www.billplz-sandbox.com/api/v3/';
  const { amount, email, name } = req.body;

  try {
    const response = await fetch(`${API_URL}bills`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collection_id: process.env.BILLPLZ_COLLECTION_ID,
        email: email,
        name: name,
        amount: Math.round(parseFloat(amount) * 100), // Added parseFloat to be safe
        callback_url: `https://${req.headers.host}/api/callback`,
        redirect_url: `https://${req.headers.host}/`
      })
    });

    const result = await response.json();

    // THIS IS THE KEY: If it's a 400, log the exact reason to Vercel Logs
    if (!response.ok) {
      console.error("Billplz Error Detail:", JSON.stringify(result));
      return res.status(400).json(result);
    }

    return res.status(200).json({ url: result.url });
  } catch (error) {
    console.error("Server Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
