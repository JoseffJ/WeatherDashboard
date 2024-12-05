import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Define a class for the Weather object
class Weather {
  temperature: number;
  windSpeed: number;
  humidity: number;
  description: string;
  icon: string;

  constructor(
    temperature: number,
    windSpeed: number,
    humidity: number,
    description: string,
    icon: string
  ) {
    this.temperature = temperature;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.description = description;
    this.icon = icon;
  }
}

// Complete the WeatherService class
class WeatherService {
  private baseURL: string = 'https://api.openweathermap.org/data/2.5';
  private apiKey: string = process.env.OPENWEATHER_API_KEY || '';
  private cityName: string = '';

  // Method to fetch location data
  private async fetchLocationData(query: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/weather?q=${query}&appid=${this.apiKey}`);
      return await response.json();
    } catch (err) {
      console.error('Error fetching location data:', err);
      throw err;
    }
  }

  // Method to destructure location data
  private destructureLocationData(locationData: any): Coordinates {
    return {
      latitude: locationData.coord.lat,
      longitude: locationData.coord.lon
    };
  }

  // Method to build geocode query
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/weather?q=${this.cityName}&appid=${this.apiKey}`;
  }

  // Method to build weather query
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/onecall?lat=${coordinates.latitude}&lon=${coordinates.longitude}&exclude=minutely,hourly&units=imperial&appid=${this.apiKey}`;
  }

  // Method to fetch and destructure location data
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(this.cityName);
    return this.destructureLocationData(locationData);
  }

  // Method to fetch weather data
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    try {
      const response = await fetch(this.buildWeatherQuery(coordinates));
      return await response.json();
    } catch (err) {
      console.error('Error fetching weather data:', err);
      throw err;
    }
  }

  // Method to parse current weather
  private parseCurrentWeather(response: any): Weather {
    return new Weather(
      response.current.temp,
      response.current.wind_speed,
      response.current.humidity,
      response.current.weather[0].description,
      response.current.weather[0].icon
    );
  }

  // Method to build forecast array
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    return weatherData.map((day: any) => {
      return new Weather(
        day.temp.day,
        day.wind_speed,
        day.humidity,
        day.weather[0].description,
        day.weather[0].icon
      );
    });
  }

  // Method to get weather for a city
  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] }> {
    this.cityName = city;
    try {
      const coordinates = await this.fetchAndDestructureLocationData();
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecast = this.buildForecastArray(currentWeather, weatherData.daily);
      return { current: currentWeather, forecast };
    } catch (err) {
      console.error('Error getting weather for city:', err);
      throw err;
    }
  }
}

export default new WeatherService();