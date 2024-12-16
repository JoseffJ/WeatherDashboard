import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const searchHistoryPath = path.join(__dirname, '../data/searchHistory.json');
const apiKey = process.env.API_KEY;
const apiBaseUrl = process.env.API_BASE_URL || 'https://api.openweathermap.org';

// Utility to read search history from JSON file
const readHistory = async () => {
  try {
    const data = await fs.readFile(searchHistoryPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading search history:', error);
    return [];
  }
};

// Utility to write updated history to JSON file
const writeHistory = async (history: any[]) => {
  try {
    await fs.writeFile(searchHistoryPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error writing search history:', error);
  }
};

// **Routes**

// GET: Fetch weather data for testing
router.get('/weather', async (_: Request, res: Response) => {
  res.status(200).json({ message: 'Weather data endpoint is working!' });
});

// GET: Retrieve search history
router.get('/history', async (_: Request, res: Response) => {
  try {
    const history = await readHistory();
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ error: 'Failed to retrieve search history.' });
  }
});

// POST: Save a city and fetch its weather data
router.post('/weather', async (req: Request, res: Response) => {
  const { cityName } = req.body;

  if (!cityName || typeof cityName !== 'string') {
    return res.status(400).json({ error: 'Valid city name is required.' });
  }

  try {
    // Fetch weather data
    const weatherUrl = `${apiBaseUrl}/data/2.5/weather?q=${encodeURIComponent(
      cityName
    )}&units=imperial&appid=${apiKey}`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data.');
    }

    const weatherData = await weatherResponse.json() as {
      main: { temp: number; humidity: number; },
      wind: { speed: number; },
      weather: { description: string; icon: string; }[]
    };

    // Read and update search history
    const history = await readHistory();
    const newCity = {
      id: Date.now().toString(),
      name: cityName,
      weather: {
        temperature: weatherData.main.temp,
        windSpeed: weatherData.wind.speed,
        humidity: weatherData.main.humidity,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
      },
    };

    history.push(newCity);
    await writeHistory(history);

    return res.status(201).json(newCity);
  } catch (error) {
    console.error('Error handling weather request:', error);
    return res.status(500).json({ error: 'Failed to fetch weather data.' });
  }
});

export default router;
