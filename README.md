# Blue Ridge Parking — Reservation Website

A reserva tion + payment site for Blue Ridge Parking (brtruckparking.com):
a landing page, a reservation form with live pricing (Daily/Weekly/Monthly),
and a Stripe Checkout backend that actually takes payment.

## What's in this folder

- `index.html` — the site itself (landing page + reservation form)
- `success.html` / `cancel.html` — pages shown after Stripe checkout
- `api/create-checkout-session.js` — serverless function that creates the
  Stripe Checkout session (this is what makes payment actually work)
- `package.json` — lists the one dependency (`stripe`)
- `.env.example` — template for your Stripe secret key

## Step 1 — Get a Stripe account

1. Go to https://stripe.com and sign up (business name, address, bank
   account/routing number for payouts, and an EIN or SSN if you're a sole
   proprietor).
2. Once logged in, go to **Developers -> API keys** in the dashboard.
3. Copy your **test** secret key (starts with `sk_test_...`) — use this
   first so you can test the whole flow without moving real money.
4. Stripe's test card number is `4242 4242 4242 4242`, any future expiry
   date, any 3-digit CVC, any ZIP.

## Step 2 — Deploy to Vercel (free)

1. Create a free account at https://vercel.com (you can sign up with
   GitHub, which makes future updates easier, or just an email).
2. Install the Vercel CLI on your computer:
   ```
   npm install -g vercel
   ```
3. From inside this folder, run:
   ```
   vercel
   ```
   Follow the prompts (link/create a project, accept the defaults).
4. Add your Stripe key as an environment variable so the backend can use
   it:
   ```
   vercel env add STRIPE_SECRET_KEY
   ```
   Paste your `sk_test_...` key when prompted, and choose all
   environments (Production, Preview, Development).
5. Deploy for real:
   ```
   vercel --prod
   ```
   Vercel will give you a live URL (something like
   `blue-ridge-parking.vercel.app`) — open it and test a full
   reservation using the Stripe test card above.

If you'd rather not use the command line, you can also deploy by pushing
this folder to a GitHub repository and importing it at vercel.com/new —
same environment variable step applies, just done through their web UI
under Project Settings -> Environment Variables.

## Step 3 — Connect brtruckparking.com

1. In your Vercel project, go to **Settings -> Domains** and add
   `brtruckparking.com`.
2. Vercel will show you 1-2 DNS records to add (usually an A record and/or
   a CNAME).
3. Log into wherever you registered the domain (Namecheap), go to the
   domain's **Advanced DNS** settings, and add the records Vercel gave
   you.
4. DNS changes can take anywhere from a few minutes to a few hours to
   take effect.

## Step 4 — Go live

Once you've tested a full reservation with the Stripe test card and
everything looks right:

1. In Stripe, flip the dashboard toggle from **Test mode** to **Live
   mode** and grab your **live** secret key (`sk_live_...`).
2. Update the environment variable in Vercel:
   ```
   vercel env rm STRIPE_SECRET_KEY
   vercel env add STRIPE_SECRET_KEY
   ```
   (paste the live key this time), then redeploy:
   ```
   vercel --prod
   ```
3. From here on, real cards will be charged and real money will land in
   your Stripe balance, paid out to your bank on the schedule you set in
   Stripe's dashboard (Settings -> Payouts).

## Changing prices later

Prices live in two places and should be kept in sync:

- `index.html` — the `RATES` object near the bottom of the file (this is
  just what's shown to the customer and used to calculate the total they
  see).
- `api/create-checkout-session.js` — the actual charge is built from
  whatever `unitPrice` and `quantity` the form sends, so as long as you
  update `index.html`'s `RATES`, the backend follows automatically. No
  separate change needed there.

## Support

Anything breaks or looks off, the fastest way to debug is:

```
vercel logs
```

which shows you what the `create-checkout-session` function is doing
(or failing to do) in real time.
