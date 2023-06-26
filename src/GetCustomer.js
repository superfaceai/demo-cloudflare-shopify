import { OneClient, PerformError, UnexpectedError } from '@superfaceai/one-sdk/cloudflare';

// import profile, map and provider assets to be bundled with the worker
// @ts-ignore
import profileGetCustomer from '../superface/customer-management.get-customer.profile';
// @ts-ignore
import mapGetCustomerShopify from '../superface/customer-management.get-customer.shopify.map.js';
// @ts-ignore
import providerShopify from '../superface/shopify.provider.json';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const client = new OneClient({
      env: {
        ONESDK_LOG: 'info', // use `debug` or `trace` for user debugging, by default is `info`
        ONESDK_DEV_LOG: 'off', // use `debug` or `trace` for development debugging, by default is `off`
        // ONESDK_CONFIG_CACHE_DURATION: <seconds> // internal assets cache, separate from cloudflare cache (default: 1 hour)
      },
      // preopens describes the virtual filesystem whith the OneSDK file convention mapped to assets
      preopens: {
        'superface/customer-management.get-customer.profile': new Uint8Array(profileGetCustomer),
        'superface/customer-management.get-customer.shopify.map.js': new Uint8Array(mapGetCustomerShopify),
        'superface/shopify.provider.json': new Uint8Array(providerShopify)
      },
      // set Superface project token here to associate metrics with the project
      // the token does not have to be set, in which case the metrics are anonymous
      token: env.SUPERFACE_PROJECT_TOKEN
    });
    const profile = await client.getProfile('customer-management/get-customer');  // profile id as defined in customer-management.get-customer.profile
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

    let response;
    try {
      // result as defined in the profile
      const ok = await result;
      response = new Response(`Result: ${JSON.stringify(ok, null, 2)}`);
    } catch (error) {
      if (error instanceof PerformError) {
        // error as defined in the profile
        response = new Response(`Error: ${JSON.stringify(error.errorResult, null, 2)}`, { status: 400 });
      } else {
        // exception - should not be part of a normal flow
        response = new Response(`${error.name}\n${error.message}`, { status: 500 });
      }
    }

    // Manually dispatch metrics but don't block the response - this will perform another request after the response is sent to the client.
    // This step is optional. If the `token` is also set when creating the OneClient then the metrics will be associated with the project,
    // otherwise they will be anonymous.
    ctx.waitUntil(client.sendMetricsToSuperface());
    return response;
  }
}
