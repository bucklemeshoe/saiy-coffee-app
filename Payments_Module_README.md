
# 💳 Payments Module — Multi-Merchant & Multi-Provider

## Overview
This module enables in-app payments for physical goods (coffee, snacks) using multiple South African and international payment providers.

**Key Goals:**
- Merchant-specific payment setup — each coffee shop uses their own provider & keys.
- Provider-agnostic architecture — add new providers without changing core order flow.
- Secure handling of API keys (server-side only).
- Webhook-based payment confirmation.
- Compliant with app store rules (physical goods — no Apple IAP required).

---

## Supported Providers (Initial Targets)
- **Yoco** — Online checkout, in-person SDKs.
- **Paystack** — API + Android SDK, split payments/subaccounts.
- **Peach Payments** — Mobile SDKs (iOS, Android) + hosted checkout.
- **Payfast** — Hosted/inline checkout via REST API.
- **Ozow** — Instant EFT (Pay by Bank).
- **SnapScan/Zapper** — QR-based checkout flows.

> Providers can be added as new adapters without altering the frontend.

---

## Architecture

### Database Tables (Supabase)
#### `merchant_payment_configs`
```
merchant_id: uuid (FK to merchants.id)
provider: text
public_key: text
secret_key: text (encrypted)
extra_config: jsonb
created_at: timestamptz default now()
```

#### `payment_intents`
```
id: uuid (PK)
merchant_id: uuid
order_id: uuid
provider: text
provider_ref: text
status: text  -- 'pending', 'paid', 'failed', 'cancelled'
amount: numeric(10,2)
currency: text default 'ZAR'
created_at: timestamptz default now()
updated_at: timestamptz default now()
```

---

## Payment Flow

1. **Frontend: Initiate Checkout**
   - User confirms order → call `/createCheckout` (Edge Function).
   - Backend selects merchant's provider & keys.
   - Calls provider API to create checkout/payment intent.
   - Returns `checkout_url` or SDK payload.

2. **Frontend: Complete Checkout**
   - Hosted: open `checkout_url` in Capacitor Browser.
   - Native SDK: launch directly.
   - On return, app checks backend for payment status.

3. **Backend: Webhook Confirmation**
   - Provider calls webhook on success/failure.
   - Webhook validates signature, updates `payment_intents` + marks `orders` as paid.

4. **Frontend: Status Update**
   - On `paid` status, show confirmation in Order Status.

---

## Provider Adapter Pattern

### Interface
```ts
interface PaymentProvider {
  createCheckout(order: Order, merchant: MerchantConfig): Promise<{ checkoutUrl?: string; sdkPayload?: any; }>;
  verifyPayment(providerRef: string, merchant: MerchantConfig): Promise<PaymentStatus>;
  refundPayment(providerRef: string, amount: number, merchant: MerchantConfig): Promise<boolean>;
}
```

### Example: Paystack Adapter
```ts
export class PaystackAdapter implements PaymentProvider {
  async createCheckout(order, merchant) {
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${merchant.secret_key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: order.customer_email,
        amount: order.amount * 100,
        reference: order.id,
        callback_url: `${APP_URL}/payments/callback/paystack`
      })
    });
    const data = await res.json();
    return { checkoutUrl: data.data.authorization_url };
  }

  async verifyPayment(ref, merchant) {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${ref}`, {
      headers: { Authorization: `Bearer ${merchant.secret_key}` }
    });
    const data = await res.json();
    return data.data.status === 'success' ? 'paid' : 'failed';
  }

  async refundPayment(ref, amount, merchant) {
    return false;
  }
}
```

---

## Webhooks

**Example: Paystack Webhook Handler**
```ts
Deno.serve(async (req) => {
  const signature = req.headers.get('x-paystack-signature');
  const rawBody = await req.text();
  
  if (!verifyPaystackSignature(rawBody, signature)) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const { reference, status } = event.data;

  await supabase.from('payment_intents').update({ status }).eq('provider_ref', reference);

  if (status === 'success') {
    await supabase.from('orders').update({ status: 'paid' }).eq('id', event.data.metadata.order_id);
  }

  return new Response('ok', { status: 200 });
});
```

---

## Merchant Onboarding

1. Admin UI form: select provider, enter API keys.
2. Store encrypted keys in `merchant_payment_configs`.
3. Test with R10 order to verify integration.
4. Go live.

---

## Frontend (Capacitor App)
```ts
async function handleCheckout(orderId) {
  const res = await fetch(`/api/createCheckout?orderId=${orderId}`);
  const { checkoutUrl } = await res.json();
  if (checkoutUrl) {
    await Browser.open({ url: checkoutUrl });
  }
}
```

---

## Security
- Never expose secret keys in client.
- All provider calls (except public init) go server-side.
- Verify webhook signatures.
- Enforce HTTPS.

---

## Future
- Stripe (global expansion)
- Apple Pay / Google Pay via existing gateways
- Crypto payments (low priority)
