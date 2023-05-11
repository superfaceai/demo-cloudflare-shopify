import { Client, PerformError } from '@superfaceai/one-sdk/cloudflare';

// @ts-ignore
import profileSubscribeWebhook from '../superface/webhook-management.subscribe-webhook.supr';
// @ts-ignore
import mapSubscribeWebhookShopify from '../superface/webhook-management.subscribe-webhook.suma.js';
// @ts-ignore
import providerShopify from '../superface/shopify.provider.json';

// See GetCustomer.js usecase for more comments
const client = new Client({
  env: {
    SF_LOG: 'trace'
  },
  preopens: {
    'superface/webhook-management.subscribe-webhook.supr': new Uint8Array(profileSubscribeWebhook),
    'superface/webhook-management.subscribe-webhook.shopify.suma.js': new Uint8Array(mapSubscribeWebhookShopify),
    'superface/shopify.provider.json': new Uint8Array(providerShopify)
  }
});

export default {
  async fetch(request, env, ctx) {
    const profile = await client.getProfile('webhook-management/subscribe-webhook');
    const usecase = profile.getUseCase('WebhookSubscription');
    const result = usecase.perform(
      {
        webhook: {
          address: 'pubsub://projectName:topicName',
          topic: 'customers/update',
          format: 'json',
        },
      },
      {
        provider: 'shopify',
        parameters: { SHOP: 'superface-test' },
        security: {
          apiKey: {
            apikey: env.SHOPIFY_ADMIN_API_KEY
          }
        }
      }
    );

    try {
      const ok = await result;
      return new Response(`Result: ${JSON.stringify(ok, null, 2)}`);
    } catch (error) {
      if (error instanceof PerformError) {
        return new Response(`Error: ${JSON.stringify(error.errorResult, null, 2)}`, { status: 400 });
      } else {
        return new Response(`${error.name}\n${error.message}`, { status: 500 });
      }
    }
  }
}
