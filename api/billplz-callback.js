import crypto from 'crypto';

export default async function handler(req, res) {
  const { id, paid, paid_at, x_signature } = req.body;

  // Verify the X Signature to confirm it's really from Billplz
  const source = [
    `id${id}`,
    `paid${paid}`,
    `paid_at${paid_at}`,
  ].join('|');

  const expected = crypto
    .createHmac('sha256', process.env.BILLPLZ_X_SIGNATURE)
    .update(source)
    .digest('hex');

  if (expected !== x_signature) {
    return res.status(400).send('Invalid signature');
  }

  if (paid === 'true') {
    // ✅ Payment confirmed — update your DB, fulfill the order, etc.
    console.log('Payment confirmed for bill:', id);
  }

  res.status(200).send('OK');
}
