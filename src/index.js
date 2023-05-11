import { Client, PerformError, UnexpectedError } from '@superfaceai/one-sdk/cloudflare';

// @ts-ignore
import profileCreateCustomer from '../superface/customer-management.create-customer.supr';
// @ts-ignore
import mapCreateCustomerShopify from '../superface/customer-management.create-customer.shopify.suma.js';
// @ts-ignore
import providerShopify from '../superface/shopify.provider.json';

const client = new Client({
  env: {
    SF_LOG: 'info' // change to `debug` or `trace` for development debugging
  },
  preopens: {
    'superface/customer-management.create-customer.supr': new Uint8Array(profileCreateCustomer),
    'superface/customer-management.create-customer.shopify.suma.js': new Uint8Array(mapCreateCustomerShopify),
    'superface/shopify.provider.json': new Uint8Array(providerShopify)
  }
});

export default {
  async fetch(request, env, ctx) {
    const result = (await client.getProfile('customer-management/create-customer')).getUseCase('CreateCustomer').perform(
      {
        customer: {
          first_name: 'Steve',
          last_name: 'Lastnameson',
          email: 'steve.lastnameson@example.com',
          phone: '+15142546011',
          verified_email: true,
          addresses: [
            {
              address1: '123 Oak St',
              city: 'Ottawa',
              province: 'ON',
              phone: '555-1212',
              zip: '123 ABC',
              last_name: 'Lastnameson',
              first_name: 'Mother',
              country: 'CA',
            }
          ],
          password: 'newpass',
          password_confirmation: 'newpass',
          send_email_welcome: false,
        }
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
      // result as defined in the profile
      const ok = await result;
      return new Response(`Result: ${JSON.stringify(ok)}`);
    } catch (error) {
      if (error instanceof PerformError) {
        // error as defined in the profile
        return new Response(`Error: ${JSON.stringify(error.errorResult)}`, { status: 400 });
      } else {
        // exception - should not be part of a normal flow
        return new Response(`${error.name}\n${error.message}`, { status: 500 });
      }
    }
  }
}
