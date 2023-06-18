import Log4js from "log4js";
Log4js.configure("log-config.json");
const logger = Log4js.getLogger("getWeather");

import fetch from "node-fetch";

export default async function getWeather(locationtxt) {
  const locationobj = JSON.parse(locationtxt);
  const location = locationobj.location;

  logger.info(`Getting Weather Data Now...`);

  const weather = await fetch(`http://api.weatherapi.com/v1/current.json?key=${botConfig.chatgpt.functions.weatherapi_apikey}&q=${location}&aqi=no&lang=ja`);
  const weatherResult = await weather.json();

  const sendWeatherData = {
    location: weatherResult.location,
    current: {
      last_updated_epoch: weatherResult.current.last_updated_epoch,
      last_updated: weatherResult.current.last_updated,
      temp_c: weatherResult.current.temp_c,
      is_day: weatherResult.current.is_day,
      condition: weatherResult.current.condition,
      humidity: weatherResult.current.humidity,
    }
  }

  return sendWeatherData
}