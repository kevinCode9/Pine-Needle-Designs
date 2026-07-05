import { config } from '../config/index.js';
import {
  BOOKING_DEPOSITS,
  ordersController,
  PAYPAL_BOOKING_DEPOSITS_AVAILABLE,
  paypal,
} from '../services/paypal.js';
import { getEmailRecipients, mailerConfigured, sendEmail } from '../services/mailer.js';

const bookingDepositMap = new Map();

export const getBookingDepositConfig = (_req, res) => {
  res.json({ enabled: PAYPAL_BOOKING_DEPOSITS_AVAILABLE });
};

export const createBookingDeposit = async (req, res) => {
  try {
    if (!PAYPAL_BOOKING_DEPOSITS_AVAILABLE) {
      return res.status(503).json({
        error: 'PayPal checkout is temporarily unavailable. Please refresh the page or try again in a few minutes. You have not been charged.',
      });
    }

    const { service, customer } = req.body || {};
    const booking = BOOKING_DEPOSITS[service];

    if (!booking) {
      return res.status(400).json({ error: 'We could not find that appointment type. Please return to the booking menu and choose an appointment again.' });
    }

    if (!customer?.name?.trim() || !customer?.email?.trim() || !customer?.phone?.trim()) {
      return res.status(400).json({ error: 'Please enter your name, email address, and phone number before continuing to PayPal.' });
    }

    const order = await ordersController.createOrder({
      prefer: 'return=representation',
      body: {
        intent: paypal.CheckoutPaymentIntent.Capture,
        purchaseUnits: [{
          referenceId: `booking-${service}`,
          description: booking.title,
          amount: {
            currencyCode: 'USD',
            value: booking.amount,
            breakdown: {
              itemTotal: { currencyCode: 'USD', value: booking.amount },
              taxTotal: { currencyCode: 'USD', value: '0.00' },
            },
          },
          items: [{
            name: booking.title,
            quantity: '1',
            unitAmount: { currencyCode: 'USD', value: booking.amount },
          }],
        }],
        applicationContext: {
          returnUrl: `${config.appBaseUrl}/booking-payment-success`,
          cancelUrl: `${config.appBaseUrl}/booking/${service}?cancelled=1`,
        },
      },
    });

    const orderBody = JSON.parse(order.body);
    const approvalLink = orderBody.links?.find((link) => link.rel === 'approve');

    if (!approvalLink) {
      throw new Error('PayPal did not return an approval link.');
    }

    bookingDepositMap.set(orderBody.id, {
      service,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
      },
    });

    res.json({ url: approvalLink.href });
  } catch (err) {
    console.error('Error creating booking deposit:', err);
    res.status(502).json({
      error: 'We could not connect to PayPal right now. Please wait a moment and try again. You have not been charged.',
    });
  }
};

export const captureBookingDeposit = async (req, res) => {
  try {
    if (!PAYPAL_BOOKING_DEPOSITS_AVAILABLE) {
      return res.status(503).json({
        error: 'We cannot confirm your deposit right now. Please do not submit another payment. Check your PayPal receipt, then contact Pine Needle Designs for help.',
      });
    }

    const { token } = req.params;
    const capture = await ordersController.captureOrder({ id: token });
    const order = JSON.parse(capture.body);
    const purchaseUnit = order.purchase_units?.[0];
    const service = String(purchaseUnit?.reference_id || '').replace(/^booking-/, '');
    const booking = BOOKING_DEPOSITS[service];
    const paid = purchaseUnit?.payments?.captures?.[0];

    if (
      !booking
      || order.status !== 'COMPLETED'
      || paid?.status !== 'COMPLETED'
      || paid?.amount?.currency_code !== 'USD'
      || paid?.amount?.value !== booking.amount
    ) {
      return res.status(400).json({
        error: 'We could not confirm your deposit. Please do not submit another payment. Check your PayPal receipt, then contact Pine Needle Designs for help.',
      });
    }

    const deposit = bookingDepositMap.get(order.id);
    bookingDepositMap.delete(order.id);

    if (deposit && mailerConfigured) {
      sendEmail({
        to: getEmailRecipients(),
        subject: `${booking.title} paid by ${deposit.customer.name}`,
        text: [
          `${booking.title} paid: $${booking.amount}`,
          `Name: ${deposit.customer.name}`,
          `Email: ${deposit.customer.email}`,
          `Phone: ${deposit.customer.phone}`,
          `PayPal order: ${order.id}`,
        ].join('\n'),
      }).catch((mailErr) => console.error('Booking deposit email failed:', mailErr));
    }

    res.json({
      success: true,
      service,
      title: booking.title,
      amount: booking.amount,
      bookingUrl: booking.calendarUrl,
    });
  } catch (err) {
    console.error('Error capturing booking deposit:', err);
    res.status(502).json({
      error: 'We cannot confirm your deposit right now. Please do not submit another payment. Check your PayPal receipt, then contact Pine Needle Designs for help.',
    });
  }
};
