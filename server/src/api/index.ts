import { Router } from 'express';
const router = Router();

// Example route: Fetch weather data
router.get('/weather', async (req, res) => {
  try {
    console.log('Fetching weather data...');
    res.status(200).json({ message: 'Weather data retrieved successfully!' });
  } catch (err) {
    console.error('Error fetching weather data:', err);
    res.status(500).json({ error: 'Failed to fetch weather data.' });
  }
});

// Example route: Fetch search history
router.get('/history', async (req, res) => {
  try {
    console.log('Fetching search history...');
    res.status(200).json({ message: 'Search history retrieved successfully!' });
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// Example POST route: Save a city and fetch weather
router.post('/weather', async (req, res) => {
  const { cityName } = req.body;

  if (!cityName || typeof cityName !== 'string') {
    return res.status(400).json({ error: 'Valid city name is required.' });
  }

  try {
    console.log(`Saving weather data for ${cityName}...`);
    res.status(200).json({ message: `Weather data for ${cityName}.` });
  } catch (err) {
    console.error('Error saving city or fetching weather data:', err);
    res.status(500).json({ error: 'Failed to save city or fetch weather data.' });
  }
});

export default router;
