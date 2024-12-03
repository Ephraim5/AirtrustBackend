const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(bodyParser.json());

const BASE_URL = 'https://accesslink.ng';
const API_KEY = process.env.ACCESSLINK_API_KEY; // API key from .env file
app.post('/paystack', (req,res)=>{
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