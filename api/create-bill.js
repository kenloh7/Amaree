export default async function handler(req, res) {
  // 1. Setup your credentials from Vercel Environment Variables
  const AUTH_TOKEN = Buffer.from(`${process.env.BILLPLZ_API_KEY}:`).toString('base64');
  const API_URL = process.env.BILLPLZ_ENDPOINT || 'https://www.billplz-sandbox.com/api/v3/';

  // 2. Get the order details from your website
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
        amount: Math.round(amount * 100), // Convert RM to cents
        callback_url: `https://${req.headers.host}/api/callback`,
        redirect_url: `https://${req.headers.host}/thank-you`
      })
    });

    const bill = await response.json();
    
    // 3. Send the Billplz link back to your website
    return res.status(200).json({ url: bill.url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
