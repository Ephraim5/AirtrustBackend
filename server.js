const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(bodyParser.json());

const BASE_URL = 'https://accesslink.ng';
const API_KEY = process.env.ACCESSLINK_API_KEY;
const PAYSTACK_SECRET_KEY = 'sk_test_bc93e86b9ed69d83864fbc06b94a672e1316767c';
app.get('/paystack/callback', async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).send({ message: 'Transaction reference is required.', data: { status: false } });
  }

  try {
    // Verify the transaction with Paystack
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',

      },
    });

    const data = response.data;
    //ephraim
    if (data.status || data.status && data.data.status === "success" || data.data.status === 'success') {
      // Handle successful payment
      console.log('Payment successful:', data);

      // You can update your database or perform other business logic here
      const redirectUrl = `https://airtrust.onrender.com/MTN?reference=${data.data.reference}&status=true`;
      res.redirect(redirectUrl);
    } else {
      // Handle failed payment
      console.log('Payment verification failed:', data);
      const redirectUrl = `https://airtrust.onrender.com/MTN?reference=${data.data.reference}&status=false`;
      res.redirect(redirectUrl)
    }
  } catch (error) {
    console.error('Error verifying payment:', error.message);
    res.status(500).send({ message: 'An error occurred while verifying payment.', error: error.message });
  }
});
app.post('/paystack', (req, res) => {
  const https = require('https')

  const params = JSON.stringify({
    "email": req.body.email,
    "amount": req.body.amount
  })

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: 'Bearer sk_test_bc93e86b9ed69d83864fbc06b94a672e1316767c',
      'Content-Type': 'application/json'
    }
  }

  const request = https.request(options, response => {
    let data = ''

    response.on('data', (chunk) => {
      data += chunk
    });

    response.on('end', () => {
      console.log(JSON.parse(data))
      res.send(data)
    })
  }).on('error', error => {
    console.error(error)
  })

  request.write(params)
  request.end()

})
// Airtime API
app.post('/api/airtime', async (req, res) => {
  const { phone, amount, network } = req.body;

  try {
    const response = await axios.post(
      `${BASE_URL}/api/airtime/`,
      { phone, amount, network },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`, // Add API key to headers
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Data API
app.post('/api/data', async (req, res) => {
  const { phone, plan, network } = req.body;

  try {
    const response = await axios.post(
      `${BASE_URL}/api/data/`,
      { phone, plan, network },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`, // Add API key to headers
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));