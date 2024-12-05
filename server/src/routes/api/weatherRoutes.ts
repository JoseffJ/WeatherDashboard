import { Router, type Request, type Response } from 'express';
import fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
const router = Router();

// Define __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON file to store cities
const citiesFilePath = path.join(__dirname, '../../data/cities.json');

// Function to read the cities from the JSON file
const readCities = async () => {
  try {
    const data = await fs.readFile(citiesFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading cities file:', err);
    return [];
  }
};

// Function to write cities to the JSON file
const writeCities = async (cities) => {
  try {
    await fs.writeFile(citiesFilePath, JSON.stringify(cities, null, 2));
  } catch (err) {
    console.error('Error writing to cities file:', err);
  }
};

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  const { cityName } = req.body;

  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    // GET weather data from OpenWeather API
    const apiKey = '57723b411370adfe429910c98534b38e';
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${apiKey}`);
    const weatherData = response.data;

    // Read the existing cities from the JSON file
    const cities = await readCities();

    // Create a new city entry with a unique ID
    const newCity = {
      id: Date.now().toString(),
      name: cityName,
      weather: {
        temperature: weatherData.main.temp,
        wind: weatherData.wind.speed,
        humidity: weatherData.main.humidity,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon
      }
    };

    // Save city to search history
    cities.push(newCity);
    await writeCities(cities);

    res.status(200).json(newCity);
  } catch (err) {
    console.error('Error retrieving weather data:', err);
    res.status(500).json({ error: 'Failed to retrieve weather data' });
  }
});

// GET search history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const cities = await readCities();
    res.status(200).json(cities);
  } catch (err) {
    console.error('Error retrieving search history:', err);
    res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const cities = await readCities();
    const updatedCities = cities.filter((city) => city.id !== id);

    if (cities.length === updatedCities.length) {
      return res.status(404).json({ error: 'City not found' });
    }

    await writeCities(updatedCities);
    res.status(200).json({ message: 'City deleted successfully' });
  } catch (err) {
    console.error('Error deleting city:', err);
    res.status(500).json({ error: 'Failed to delete city' });
  }
});

// Define route to serve index.html
router.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

export default router;
