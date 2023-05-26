import { Client, PerformError } from '@superfaceai/one-sdk/cloudflare';

// @ts-ignore
import comlinkProfile from '../superface/communication.send-email.supr';
// @ts-ignore
import comlinkMapResend from '../superface/communication.send-email.resend.suma.js';
// @ts-ignore
import comlinkMapMailgun from '../superface/communication.send-email.mailgun.suma.js';
// @ts-ignore
import comlinkProvider from '../superface/resend.provider.json';

export default {
  async fetch(request, env, ctx) {
    // See GetCustomer.js usecase for more comments
    const client = new Client({
      preopens: {
        'superface/communication.send-email.supr': new Uint8Array(comlinkProfile),
        'superface/communication.send-email.resend.suma.js': new Uint8Array(comlinkMapResend),
        'superface/communication.send-email.mailgun.suma.js': new Uint8Array(comlinkMapMailgun),
        'superface/resend.provider.json': new Uint8Array(comlinkProvider)
      }
    });

    // Resend
    // const inputs = {
    //   from: "onboarding@resend.dev",
    //   to: "z@superface.ai",
    //   subject: "Hello World",
    //   html: "<p>Hello from EDGARX on the edge!</p>",
    // };

    // const provider = {
    //   provider: 'resend',
    //   parameters: {},
    //   security: { bearer_token: { token: env.RESEND_TOKEN } }
    // }

    // Mailgun
    const inputs = {
      from: 'demo@demo.superface.org',
      to: 'z@superface.ai',
      subject: 'Hello World from EDGAR',
      text: 'This is a plain text email with mailgun.'
    };

    const provider = {
      provider: 'mailgun',
      parameters: { DOMAIN: env.MAILGUN_DOMAIN },
      security: { basic: { username: env.MAILGUN_USERNAME, password: env.MAILGUN_PASSWORD } }
    }

    const profile = await client.getProfile('communication/send-email');
    const result = await profile
      .getUseCase('SendEmail')
      .perform(inputs, provider);

    try {
      const ok = await result;
      return new Response(`Result: ${JSON.stringify(ok, null, 2)}`);
    } catch (error) {
      if (error instanceof PerformError) {
        let response = 'Error:';
        for (const [key, value] of Object.entries(error.errorResult)) {
          response += `\n${key}: ${value}`;
        }
        return new Response(response, { status: 400 });
      } else {
        return new Response(`${error.name}\n${error.message}`, { status: 500 });
      }
    }
  }
}
