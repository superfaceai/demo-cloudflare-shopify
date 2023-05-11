import { Client, PerformError, UnexpectedError } from '@superfaceai/one-sdk/cloudflare';

// import profile, map and provider as assets to be bundled along with the worker
// @ts-ignore
import profileGetCustomer from '../superface/customer-management.get-customer.supr';
// @ts-ignore
import mapGetCustomerShopify from '../superface/customer-management.get-customer.shopify.suma.js';
// @ts-ignore
import providerShopify from '../superface/shopify.provider.json';

const client = new Client({
  env: {
    SF_LOG: 'info' // change to `debug` or `trace` for development debugging
    // also possible to configure how long are document cached inside the core (separate from cloudflare cache)
    // SF_CONFIG_CACHE_DURATION: <seconds> // default is 1 hour
  },
  // preopens describe a virtual filesystem in which relevant files are expected
  // the prefix `superface/` is configurable in this object by setting `assetsPath`.
  // maps, profiles and providers and looked up under `assetsPath` in the following form:
  preopens: {
    'superface/customer-management.get-customer.supr': new Uint8Array(profileGetCustomer),
    'superface/customer-management.get-customer.shopify.suma.js': new Uint8Array(mapGetCustomerShopify),
    'superface/shopify.provider.json': new Uint8Array(providerShopify)
  }
});

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // this profile name (in combination with the provider name passed below) is what is used to look up the profile, provider and map
    // so this name needs to match the name in `preopens` above - or in the future a name of a profile in the Superface registry
    const profile = await client.getProfile('customer-management/get-customer');
    const usecase = profile.getUseCase('RetrieveCustomer');
    const result = usecase.perform(
      // this is the input of the perform
      {
        customer_id: url.searchParams.get('customer_id'),
        fields: 'id, firstName, lastName, email'
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
        return new Response(`${error.name}\n${error.message}`, { status: 500 });
      }
    }
  }
}
