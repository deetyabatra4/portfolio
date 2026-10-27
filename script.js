
const cityInput = document.getElementById("cityInput");
const weatherButton = document.getElementById("weatherButton");
const weatherResult = document.getElementById("weatherResult");
const themeToggle = document.getElementById("themeToggle");

const weatherDescriptions = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snowfall",
  73: "Snowfall",
  75: "Heavy snowfall",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail"
};

function updateThemeButton() {
  const isDarkMode = document.body.classList.contains("dark-mode");

  themeToggle.textContent = isDarkMode
    ? "Switch to Light Mode"
    : "Switch to Dark Mode";

  themeToggle.setAttribute("aria-pressed", String(isDarkMode));
}

function setTheme(isDarkMode) {
  document.body.classList.toggle("dark-mode", isDarkMode);
  localStorage.setItem("portfolio-theme", isDarkMode ? "dark" : "light");
  updateThemeButton();
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem("portfolio-theme");

  setTheme(savedTheme === "dark");
}

async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    weatherResult.textContent = "Please enter a city name.";
    cityInput.focus();
    return;
  }

  weatherResult.textContent = "Finding weather information...";
  weatherResult.classList.add("loading");
  weatherButton.disabled = true;
  weatherButton.textContent = "Loading...";

  try {
    const locationResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    if (!locationResponse.ok) {
      throw new Error("Location search failed.");
    }

    const locationData = await locationResponse.json();

    if (!locationData.results || locationData.results.length === 0) {
      throw new Error("City not found.");
    }

    const location = locationData.results[0];

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
    );

    if (!weatherResponse.ok) {
      throw new Error("Weather data could not be loaded.");
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    const description =
      weatherDescriptions[current.weather_code] || "Current conditions";

    weatherResult.textContent =
      `${location.name}, ${location.country}: ` +
      `${Math.round(current.temperature_2m)}°C, ` +
      `${description}. Feels like ` +
      `${Math.round(current.apparent_temperature)}°C ` +
      `with wind at ${Math.round(current.wind_speed_10m)} km/h.`;

  } catch (error) {
    weatherResult.textContent =
      error.message === "City not found."
        ? "City not found. Please try another city."
        : "Unable to load weather data. Please try again.";
  } finally {
    weatherResult.classList.remove("loading");
    weatherButton.disabled = false;
    weatherButton.textContent = "Get Weather";
  }
}

weatherButton.addEventListener("click", getWeather);

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    getWeather();
  }
});

themeToggle.addEventListener("click", () => {
  const isDarkMode = document.body.classList.contains("dark-mode");
  setTheme(!isDarkMode);
});

loadSavedTheme();
