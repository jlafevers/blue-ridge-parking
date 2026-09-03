// Vercel serverless function: /api/create-checkout-session
// Creates a Stripe Checkout Session for a Blue Ridge Parking reservation.
//
// Requires an environment variable STRIPE_SECRET_KEY set in your Vercel
// project (Project Settings -> Environment Variables). Use your Stripe
// TEST secret key while testing, and your LIVE secret key once you're
// ready to accept real payments.

const Stripe = require('stripe');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(500).json({
      error: 'Server is not configured with a Stripe secret key yet (STRIPE_SECRET_KEY).',
    });
    return;
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const {
      name,
      phone,
      email,
      plate,
      startDate,
      plan,
      planLabel,
      unit,
      quantity,
      unitPrice,
      total,
    } = req.body || {};

    // Basic server-side validation — never trust the client-side total alone.
    if (!name || !phone || !email || !plate || !startDate || !plan || !quantity || !unitPrice) {
      res.status(400).json({ error: 'Missing required reservation details.' });
      return;
    }

    const qty = parseInt(quantity, 10);
    const price = parseFloat(unitPrice);
    if (!Number.isFinite(qty) || qty < 1 || !Number.isFinite(price) || price <= 0) {
      res.status(400).json({ error: 'Invalid quantity or price.' });
      return;
    }

    const recomputedTotal = qty * price;

    const origin =
      req.headers.origin ||
      `https://${req.headers.host}` ||
      'https://brtruckparking.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(price * 100), // cents
            product_data: {
              name: `Blue Ridge Parking — ${planLabel || plan} reservation`,
              description: `${qty} ${unit || 'unit'}(s) starting ${startDate} — plate ${plate}`,
            },
          },
          quantity: qty,
        },
      ],
      metadata: {
        name,
        phone,
        plate,
        startDate,
        plan,
        unit: unit || '',
        quantity: String(qty),
        unitPrice: String(price),
        total: String(recomputedTotal),
      },
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel.html`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    res.status(500).json({ error: 'Could not create a checkout session. Please try again.' });
  }
};
