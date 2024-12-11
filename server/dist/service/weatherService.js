import dotenv from 'dotenv';
dotenv.config();
// Define a class for the Weather object
class Weather {
    constructor(temperature, windSpeed, humidity, description, icon) {
        this.temperature = temperature;
        this.windSpeed = windSpeed;
        this.humidity = humidity;
        this.description = description;
        this.icon = icon;
    }
}
// Complete the WeatherService class
class WeatherService {
    constructor() {
        this.baseURL = 'https://api.openweathermap.org/data/2.5';
        this.apiKey = process.env.OPENWEATHER_API_KEY || '';
        this.cityName = '';
    }
    // Method to fetch location data
    async fetchLocationData(query) {
        try {
            const response = await fetch(`${this.baseURL}/weather?q=${query}&appid=${this.apiKey}`);
            return await response.json();
        }
        catch (err) {
            console.error('Error fetching location data:', err);
            throw err;
        }
    }
    // Method to destructure location data
    destructureLocationData(locationData) {
        return {
            latitude: locationData.coord.lat,
            longitude: locationData.coord.lon
        };
    }
    // Method to build weather query
    buildWeatherQuery(coordinates) {
        return `${this.baseURL}/onecall?lat=${coordinates.latitude}&lon=${coordinates.longitude}&exclude=minutely,hourly&units=imperial&appid=${this.apiKey}`;
    }
    // Method to fetch and destructure location data
    async fetchAndDestructureLocationData() {
        const locationData = await this.fetchLocationData(this.cityName);
        return this.destructureLocationData(locationData);
    }
    // Method to fetch weather data
    async fetchWeatherData(coordinates) {
        try {
            const response = await fetch(this.buildWeatherQuery(coordinates));
            return await response.json();
        }
        catch (err) {
            console.error('Error fetching weather data:', err);
            throw err;
        }
    }
    // Method to parse current weather
    parseCurrentWeather(response) {
        return new Weather(response.current.temp, response.current.wind_speed, response.current.humidity, response.current.weather[0].description, response.current.weather[0].icon);
    }
    // Method to build forecast array
    buildForecastArray(weatherData) {
        return weatherData.map((day) => {
            return new Weather(day.temp.day, day.wind_speed, day.humidity, day.weather[0].description, day.weather[0].icon);
        });
    }
    // Method to get weather for a city
    async getWeatherForCity(city) {
        this.cityName = city;
        try {
            const coordinates = await this.fetchAndDestructureLocationData();
            const weatherData = await this.fetchWeatherData(coordinates);
            const currentWeather = this.parseCurrentWeather(weatherData);
            const forecast = this.buildForecastArray(weatherData.daily);
            return { current: currentWeather, forecast };
        }
        catch (err) {
            console.error('Error getting weather for city:', err);
            throw err;
        }
    }
}
export default new WeatherService();
