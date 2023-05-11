import { Client, PerformError, UnexpectedError } from '@superfaceai/one-sdk/cloudflare';

// @ts-ignore
import profileProductUpdate from '../superface/product-management.product-update.supr';
// @ts-ignore
import mapProductUpdateShopify from '../superface/product-management.product-update.shopify.suma.js';
// @ts-ignore
import providerShopify from '../superface/shopify.provider.json';

const client = new Client({
  env: {
    SF_LOG: 'info', // change to `debug` or `trace` for development debugging
    // also possible to configure how long to cache documents inside the core (separate from cloudflare cache)
    // SF_CONFIG_CACHE_DURATION: <seconds>, // default is 1 hour
  },
  // preopens describe a virtual filesystem in which relevant files are expected
  // the prefix `superface/` is configurable in this object by setting `assetsPath`.
  // maps, profiles and providers and looked up under `assetsPath` in the following form:
  preopens: {
    'superface/product-management.product-update.supr': new Uint8Array(profileProductUpdate),
    'superface/product-management.product-update.shopify.suma.js': new Uint8Array(mapProductUpdateShopify),
    'superface/shopify.provider.json': new Uint8Array(providerShopify)
  }
});

export default {
  async fetch(request, env, ctx) {
    // this profile name (in combination with the provider name passed below) is what is used to look up the profile, provider and map
    // so this name needs to match the name in `preopens` above - or in the future a name of a profile in the Superface registry
    const profile = await client.getProfile('product-management/product-update');
    const usecase = profile.getUseCase('UpdateProduct');

    // we don't use the request in any way, just directly run a perform - since this is an update it should probably respond only to PUT requests

    const result = usecase.perform(
      // this is the input of the perform
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
        provider: 'shopify', // provider specified here
        parameters: { SHOP: 'superface-test' }, // parameters are declared in shopify.provider.json - this one is directly interpolated into the baseUrl
        security: { // apiKey security is defined in shopify.provider.json, and requires one value `apiKey` which is sources from the worker environment
          apiKey: {
            apikey: env.SHOPIFY_ADMIN_API_KEY
          }
        }
      }
    );

    try {
      // result as defined in the profile
      const ok = await result;
      return new Response(`Result: ${JSON.stringify(ok, null, 2)}`);
    } catch (error) {
      if (error instanceof PerformError) {
        // error as defined in the profile
        return new Response(`Error: ${JSON.stringify(error.errorResult, null, 2)}`, { status: 400 });
      } else {
        // exception - should not be part of a normal flow
        // type of error here is UnexpectedError
        return new Response(`${error.name}\n${error.message}`, { status: 500 });
      }
    }
  }
}
