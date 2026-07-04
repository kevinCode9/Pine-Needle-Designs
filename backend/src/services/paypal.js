import * as paypal from '@paypal/paypal-server-sdk';
import { config, isLocalApp } from '../config/index.js';
import { BOOKING_DEPOSITS } from '../constants/index.js';

const paypalEnvironment = isLocalApp ? paypal.Environment.Sandbox : paypal.Environment.Production;
const paypalClientId = isLocalApp ? config.paypal.sandboxClientId : config.paypal.clientId;
const paypalClientSecret = isLocalApp ? config.paypal.sandboxClientSecret : config.paypal.clientSecret;

export const PAYPAL_BOOKING_DEPOSITS_AVAILABLE = config.paypal.bookingDepositsEnabled
  && Boolean(paypalClientId && paypalClientSecret);

if (config.paypal.bookingDepositsEnabled && !PAYPAL_BOOKING_DEPOSITS_AVAILABLE) {
  console.error('❌ PayPal booking deposits are enabled, but PayPal credentials are missing.');
}

const client = new paypal.Client({
  environment: paypalEnvironment,
  clientCredentialsAuthCredentials: {
    oAuthClientId: paypalClientId,
    oAuthClientSecret: paypalClientSecret,
  },
});

export const ordersController = new paypal.OrdersController(client);
export { paypal, BOOKING_DEPOSITS };
