export default async function handler(req, res) {
  // 1. Setup Authentication using your Vercel Environment Variables
  // We use 'Basic' auth which combines your API Key with a colon
  const AUTH_TOKEN = Buffer.from(`${process.env.BILLPLZ_API_KEY}:`).toString('base64');
  
  // Use the Sandbox URL for testing, or the Production URL for real sales
  const API_URL = process.env.BILLPLZ_ENDPOINT || 'https://www.billplz-sandbox.com/api/v3/';

  // 2. Extract order data sent from your index.html placeOrder() function
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
        amount: Math.round(amount * 100), // IMPORTANT: Billplz uses cents (RM49 = 4900)
        callback_url: `https://${req.headers.host}/api/callback`,
        redirect_url: `https://${req.headers.host}/#home` // Where they land after paying
      })
    });

    const bill = await response.json();

    // 3. Return the unique Billplz payment URL to your website
    if (bill.url) {
      return res.status(200).json({ url: bill.url });
    } else {
      return res.status(400).json({ error: "Could not create bill", detail: bill });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
