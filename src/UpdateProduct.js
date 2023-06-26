import { OneClient, PerformError } from '@superfaceai/one-sdk/cloudflare';

// @ts-ignore
import profileProductUpdate from '../superface/product-management.product-update.profile';
// @ts-ignore
import mapProductUpdateShopify from '../superface/product-management.product-update.shopify.map.js';
// @ts-ignore
import providerShopify from '../superface/shopify.provider.json';

export default {
  async fetch(request, env, ctx) {
    // here we don't use the request parameter as this is just an example

    // See GetCustomer.js usecase for more comments
    const client = new OneClient({
      preopens: {
        'superface/product-management.product-update.profile': new Uint8Array(profileProductUpdate),
        'superface/product-management.product-update.shopify.map.js': new Uint8Array(mapProductUpdateShopify),
        'superface/shopify.provider.json': new Uint8Array(providerShopify)
      },
      token: undefined
    });
    const profile = await client.getProfile('product-management/product-update');
    const usecase = profile.getUseCase('UpdateProduct');

    const result = usecase.perform(
      {
        product: {
          body_html: "It's the small iPod with a big idea: Video.",
          handle: 'ipod-nano',
          id: 8296827257108,
          images: [
            {
              product_id: 8296827257108,
              position: 1,
              src: 'http://example.com/burton.jpg',
            }
          ],
          options: {
            product_id: 8296827257108,
            name: 'Color',
            position: 1,
            values: [
              'Pink'
            ],
          },
          product_type: 'Cult Products',
          status: 'active',
          tags: 'Emotive, Flash Memory, MP3, Music',
          template_suffix: 'special',
          title: 'IPod Nano - 8GB',
          variants: [
            {
              product_id: 8296827257108,
              option1: 'Pink',
              position: 1,
              price: 199.99,
              sku: 'IPOD2008PINK',
              title: 'Pink',
            }
          ],
          vendor: 'Apple',
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
