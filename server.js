const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));

const APP_SECRET = process.env.APP_SECRET;

app.post('/api/chat', async (req, res) => {
  try {
    // Verify app secret
    const reqSecret = req.headers['x-app-secret'];
    if (APP_SECRET && reqSecret !== APP_SECRET) {
      console.warn('Unauthorized request blocked');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('No API key found');
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('Received request, forwarding to Anthropic...');

    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: body,
    });

    const text = await response.text();
    console.log('Anthropic response status:', response.status);

    res.setHeader('Content-Type', 'application/json');
    res.status(response.status).send(text);

  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Pantry backend running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
