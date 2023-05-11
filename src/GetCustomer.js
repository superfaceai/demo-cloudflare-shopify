import { Client, PerformError, UnexpectedError } from '@superfaceai/one-sdk/cloudflare';

// import profile, map and provider assets to be bundled with the worker
// @ts-ignore
import profileGetCustomer from '../superface/customer-management.get-customer.supr';
// @ts-ignore
import mapGetCustomerShopify from '../superface/customer-management.get-customer.shopify.suma.js';
// @ts-ignore
import providerShopify from '../superface/shopify.provider.json';

const client = new Client({
  env: {
    SF_LOG: 'info' // use `debug` or `trace` for development debugging
    // SF_CONFIG_CACHE_DURATION: <seconds> // internal assets cache, separate from cloudflare cache (default: 1 hour)
  },
  // preopens describes the virtual filesystem whith the OneSDK file convention mapped to assets
  preopens: {
    'superface/customer-management.get-customer.supr': new Uint8Array(profileGetCustomer),
    'superface/customer-management.get-customer.shopify.suma.js': new Uint8Array(mapGetCustomerShopify),
    'superface/shopify.provider.json': new Uint8Array(providerShopify)
  }
});

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const profile = await client.getProfile('customer-management/get-customer');  // profile id as defined in customer-management.get-customer.supr
    const usecase = profile.getUseCase('RetrieveCustomer'); // use case name as defined in the profile
    const result = usecase.perform(
      // input of the perform
      {
        customer_id: url.searchParams.get('customer_id'),
        fields: 'id, firstName, lastName, email'
      },
      // provider configuration
      {
        provider: 'shopify', // provider id as defined in shopify.provider.json
        parameters: { SHOP: 'superface-test' }, // provider-specific parameters as defined in shopify.provider.json
        security: { // apiKey security as defined in shopify.provider.json, and requires the `apiKey` value which is sources from the worker environment
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
        return new Response(`${error.name}\n${error.message}`, { status: 500 });
      }
    }
  }
}
