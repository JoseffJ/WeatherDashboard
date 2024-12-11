// Define a City class with name and id properties
class City {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
import fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Define __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Path to searchHistory.json file
const historyFilePath = path.join(__dirname, '../../data/searchHistory.json');
// HistoryService class
class HistoryService {
    // Method to read from the searchHistory.json file
    async read() {
        try {
            const data = await fs.readFile(historyFilePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (err) {
            console.error('Error reading search history file:', err);
            return [];
        }
    }
    // Method to write the updated cities array to the searchHistory.json file
    async write(cities) {
        try {
            await fs.writeFile(historyFilePath, JSON.stringify(cities, null, 2));
        }
        catch (err) {
            console.error('Error writing to search history file:', err);
        }
    }
    // Method to get cities from the searchHistory.json file
    async getCities() {
        return await this.read();
    }
    // Method to add a city to the searchHistory.json file
    async addCity(cityName) {
        try {
            const cities = await this.read();
            const newCity = new City(Date.now().toString(), cityName);
            cities.push(newCity);
            await this.write(cities);
        }
        catch (err) {
            console.error('Error adding city to search history:', err);
        }
    }
    // BONUS: Method to remove a city from the searchHistory.json file
    async removeCity(id) {
        try {
            const cities = await this.read();
            const updatedCities = cities.filter((city) => city.id !== id);
            if (cities.length === updatedCities.length) {
                console.error('City not found');
                return;
            }
            await this.write(updatedCities);
        }
        catch (err) {
            console.error('Error removing city from search history:', err);
        }
    }
}
export default new HistoryService();
