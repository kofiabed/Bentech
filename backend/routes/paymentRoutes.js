const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Route 1: Initialize Payment
router.post('/initialize', async (req, res) => {
  const { email, amount } = req.body; // amount should be in GHS

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Paystack counts in pesewas (1 GHS = 100 pesewas)
        currency: 'GHS',
        callback_url: `${req.get('origin') || (process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',')[0].trim() : 'http://localhost:5173')}/success`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Send the authorization URL and reference key back to the web frontend
    res.status(200).json(response.data.data);
  } catch (error) {
    console.error('Paystack Init Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to initialize payment gateway.' });
  }
});

// Route 2: Verify Payment Status (Security Check)
router.get('/verify/:reference', async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (response.data.data.status === 'success') {
      // SUCCESS: Update order state to "Paid" in your MongoDB database here!
      return res.status(200).json({ status: 'success', message: 'Payment verified successfully.' });
    }

    res.status(400).json({ status: 'failed', message: 'Payment verification failed.' });
  } catch (error) {
    console.error('Verification Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error checking transaction status.' });
  }
});

// Route 3: Paystack Webhook for automatic payment verification
router.post('/webhook', (req, res) => {
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send('Unauthorized');
  }

  if (req.body.event === 'charge.success') {
    // Payment successful - find and update order by reference
    console.log('Paystack charge.success event:', req.body.data.reference);
    // Update order status to 'Paid' here
  }

  res.sendStatus(200);
});

module.exports = router;