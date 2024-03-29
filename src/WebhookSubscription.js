import { OneClient, PerformError } from '@superfaceai/one-sdk-cloudflare';

// @ts-ignore
import profileSubscribeWebhook from '../superface/webhook-management.subscribe-webhook.profile';
// @ts-ignore
import mapSubscribeWebhookShopify from '../superface/webhook-management.subscribe-webhook.map.js';
// @ts-ignore
import providerShopify from '../superface/shopify.provider.json';

export default {
  async fetch(request, env, ctx) {
    // See GetCustomer.js usecase for more comments
    const client = new OneClient({
      env: {
        ONESDK_LOG: 'trace'
      },
      preopens: {
        'superface/webhook-management.subscribe-webhook.profile': new Uint8Array(profileSubscribeWebhook),
        'superface/webhook-management.subscribe-webhook.shopify.map.js': new Uint8Array(mapSubscribeWebhookShopify),
        'superface/shopify.provider.json': new Uint8Array(providerShopify)
      },
      token: undefined
    });
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

    let response;
    try {
      const ok = await result;
      response = new Response(`Result: ${JSON.stringify(ok, null, 2)}`);
    } catch (error) {
      if (error instanceof PerformError) {
        response = new Response(`Error: ${JSON.stringify(error.errorResult, null, 2)}`, { status: 400 });
      } else {
        response = new Response(`${error.name}\n${error.message}`, { status: 500 });
      }
    }

    ctx.waitUntil(client.sendMetricsToSuperface());
    return response;
  }
}
