// pages/api/create-bill.js  (or app/api/create-bill/route.js for App Router)
export default async function handler(req, res) {
  const { name, email, amount, description } = req.body;

  const params = new URLSearchParams({
    collection_id: process.env.BILLPLZ_COLLECTION_ID,
    email,
    name,
    amount: String(Math.round(amount * 100)), // in cents
    description,
    callback_url: `${process.env.NEXT_PUBLIC_URL}/api/billplz-callback`,
    redirect_url: `${process.env.NEXT_PUBLIC_URL}/payment/success`,
  });

  const response = await fetch('https://www.billplz.com/api/v3/bills', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(process.env.BILLPLZ_API_KEY + ':').toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const bill = await response.json();
  if (!response.ok) return res.status(400).json(bill);

  res.json({ url: bill.url, bill_id: bill.id });
}
