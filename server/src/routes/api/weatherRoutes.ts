import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();
const searchHistoryPath = path.join(__dirname, '../../data/searchHistory.json');
const apiBaseUrl = process.env.API_BASE_URL;
const apiKey = process.env.API_KEY;

// API route to retrieve search history
router.get('/history', async (_, res) => {
  try {
    const data = await fs.readFile(searchHistoryPath, 'utf-8');
    const cities = JSON.parse(data);
    res.status(200).json(cities);
  } catch (err) {
    console.error('Error reading search history:', err);
    res.status(500).json({ error: 'Failed to retrieve search history.' });
  }
});

// API route to save city and fetch weather data
router.post('/', async (req, res) => {
  const { cityName } = req.body;

  if (!cityName) {
    return res.status(400).json({ error: 'City name is required.' });
  }

  try {
    // Read current search history
    const data = await fs.readFile(searchHistoryPath, 'utf-8');
    const cities = JSON.parse(data);

    // Generate a unique ID for the city
    const cityId = Date.now().toString();

    // Fetch weather data from OpenWeather API using fetch
    const weatherResponse = await fetch(
      `${apiBaseUrl}/data/2.5/weather?q=${cityName}&units=imperial&appid=${apiKey}`
    );

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();

    // Save city with weather data
    const newCity = {
      id: cityId,
      name: cityName,
      weather: {
        temperature: weatherData.main.temp,
        windSpeed: weatherData.wind.speed,
        humidity: weatherData.main.humidity,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon
      }
    };

    cities.push(newCity);

    // Write updated search history
    await fs.writeFile(searchHistoryPath, JSON.stringify(cities, null, 2));

    return res.status(201).json(newCity);
  } catch (err) {
    console.error('Error handling weather data request:', err);
    return res.status(500).json({ error: 'Failed to save city or fetch weather data.' });
  }
});

// Define route to serve index.html
router.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

export default router;
