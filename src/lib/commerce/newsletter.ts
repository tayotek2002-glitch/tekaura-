/**
 * Mailing-list boundary. No provider is connected yet, so `subscribe` stores
 * nothing and reports that honestly. To connect Klaviyo / Mailchimp / Shopify
 * Email etc., add a server route (e.g. app/api/subscribe/route.ts) that calls
 * the provider, then set `newsletterConfigured = true` and post to it here.
 */
export const newsletterConfigured = false;

export async function subscribe(email: string): Promise<{ ok: boolean; message: string }> {
  void email;
  if (!newsletterConfigured) {
    return { ok: false, message: "Sign-up isn't connected yet, so your email address has not been saved." };
  }
  return { ok: true, message: "You're on the list." };
}
