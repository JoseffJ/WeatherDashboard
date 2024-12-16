import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const searchHistoryPath = path.join(__dirname, '../../data/searchHistory.json');
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

// **API ROUTES**

// GET: Retrieve search history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const history = await readHistory();
    res.status(200).json(history);
  } catch (error) {
    console.error('Error retrieving history:', error);
    res.status(500).json({ error: 'Failed to retrieve search history.' });
  }
});

// POST: Save a city and fetch its weather data
router.post('/', async (req: Request, res: Response) => {
  const { cityName } = req.body;

  if (!cityName) {
    return res.status(400).json({ error: 'City name is required.' });
  }

  try {
    // Fetch weather data
    const weatherUrl = `${apiBaseUrl}/data/2.5/weather?q=${encodeURIComponent(
      cityName
    )}&units=imperial&appid=${apiKey}`;

    const response = await fetch(weatherUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data.');
    }

    const weatherData = await response.json() as {
      main: { temp: number; humidity: number };
      wind: { speed: number };
      weather: { description: string; icon: string }[];
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

    res.status(201).json(newCity);
  } catch (error) {
    console.error('Error handling weather request:', error);
    res.status(500).json({ error: 'Failed to fetch weather data.' });
  }
});

// DELETE: Remove a city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const history = await readHistory();
    const updatedHistory = history.filter((city: any) => city.id !== id);

    if (history.length === updatedHistory.length) {
      return res.status(404).json({ error: 'City not found.' });
    }

    await writeHistory(updatedHistory);
    res.status(200).json({ message: 'City deleted successfully.' });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ error: 'Failed to delete city.' });
  }
});

export default router;
