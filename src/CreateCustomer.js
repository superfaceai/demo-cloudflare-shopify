import { OneClient, PerformError } from '@superfaceai/one-sdk-cloudflare';

// @ts-ignore
import profileCreateCustomer from '../superface/customer-management.create-customer.profile';
// @ts-ignore
import mapCreateCustomerShopify from '../superface/customer-management.create-customer.shopify.map.js';
// @ts-ignore
import providerShopify from '../superface/shopify.provider.json';

/** Generates a random string within given length range from given alphabeth.
 * 
 * This is just for the demo and in real usage we would of course take this from user input.
 */
function demoRandomString(alphabet, minLength, maxLength) {
  let result = '';

  const length = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
  for (let i = 0; i < length; i += 1) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return result;
}
demoRandomString('abcdefghijklmnopqrstuvwxyz', 3, 10)

export default {
  async fetch(request, env, ctx) {
    // See GetCustomer.js usecase for more comments
    const client = new OneClient({
      preopens: {
        'superface/customer-management.create-customer.profile': new Uint8Array(profileCreateCustomer),
        'superface/customer-management.create-customer.shopify.map.js': new Uint8Array(mapCreateCustomerShopify),
        'superface/shopify.provider.json': new Uint8Array(providerShopify)
      },
      token: undefined
    });

    const firstName = demoRandomString('abcdefghijklmnopqrstuvwxyz', 3, 10);
    const lastName = demoRandomString('abcdefghijklmnopqrstuvwxyz', 3, 10);
    const phoneNumber = demoRandomString('0123456789', 11, 11);

    const profile = await client.getProfile('customer-management/create-customer');
    const usecase = profile.getUseCase('CreateCustomer');
    const result = usecase.perform(
      {
        customer: {
          first_name: `${firstName.charAt(0).toUpperCase()}${firstName.substring(1)}`,
          last_name: `${lastName.charAt(0).toUpperCase()}${lastName.substring(1)}`,
          email: `${firstName}.${lastName}@example.com`,
          phone: `+${phoneNumber}`,
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

    let response;
    try {
      const ok = await result;
      response = new Response(`Result: ${JSON.stringify(ok, null, 2)}`);
    } catch (error) {
      if (error instanceof PerformError) {
        let response = 'Error:';
        for (const [key, value] of Object.entries(error.errorResult)) {
          response += `\n${key}: ${value}`;
        }
        response = new Response(response, { status: 400 });
      } else {
        response = new Response(`${error.name}\n${error.message}`, { status: 500 });
      }
    }

    ctx.waitUntil(client.sendMetricsToSuperface());
    return response;
  }
}
