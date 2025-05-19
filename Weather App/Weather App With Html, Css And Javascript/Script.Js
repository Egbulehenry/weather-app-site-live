const cityInput = document.getElementById('cityInput');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const weatherResult = document.getElementById('weatherResult');
const forecastContainer = document.getElementById('forecastContainer');
const currentTime = document.getElementById('currentTime');

const apiKey = '795c9b2bd09f7bd550475f2308e12607'; // Replace with your OpenWeatherMap API key
const currentApiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=';
const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=';

// Weather condition to Icons8 image mapping
const weatherIcons = {
    'clear': 'https://img.icons8.com/color/96/000000/sun.png',
    'clouds': 'https://img.icons8.com/color/96/000000/partly-cloudy-day.png',
    'rain': 'https://img.icons8.com/color/96/000000/rain.png',
    'drizzle': 'https://img.icons8.com/color/96/000000/light-rain.png',
    'thunderstorm': 'https://img.icons8.com/color/96/000000/storm.png',
    'snow': 'https://img.icons8.com/color/96/000000/snow.png',
    'mist': 'https://img.icons8.com/color/96/000000/fog-day.png',
    'fog': 'https://img.icons8.com/color/96/000000/fog-day.png',
    'haze': 'https://img.icons8.com/color/96/000000/fog-day.png',
    'wind': 'https://img.icons8.com/color/96/000000/wind.png'
};

// Update current time every second
function updateTime() {
    const now = new Date();
    currentTime.textContent = now.toLocaleTimeString('en-US', { hour12: true });
}
setInterval(updateTime, 1000);
updateTime(); // Initial call

getWeatherBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

function getWeather() {
    const city = cityInput.value.trim();
    weatherResult.classList.remove('active');
    forecastContainer.innerHTML = ''; // Clear previous forecast
    if (city === '') {
        weatherResult.innerHTML = 'Please enter a city name.';
        return;
    }

    // Fetch current weather
    fetch(`${currentApiUrl}${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === '404') {
                weatherResult.innerHTML = 'City not found.';
            } else {
                const temp = data.main.temp;
                const condition = data.weather[0].main.toLowerCase();
                const description = data.weather[0].description;
                const humidity = data.main.humidity;
                const windSpeed = data.wind.speed;
                const countryCode = data.sys.country;
                const iconUrl = weatherIcons[condition] || weatherIcons['clouds']; // Fallback to clouds

                weatherResult.innerHTML = `
                    <h2>${city} <img class="flag" src="https://flagsapi.com/${countryCode}/flat/64.png" alt="${countryCode} flag"></h2>
                    <div class="weather-item">
                        <img src="${iconUrl}" alt="Temperature icon">
                        <span>Temperature: ${temp}°C</span>
                    </div>
                    <div class="weather-item">
                        <img src="${iconUrl}" alt="Condition icon">
                        <span>Condition: ${description}</span>
                    </div>
                    <div class="weather-item">
                        <img src="${weatherIcons['humidity'] || 'https://img.icons8.com/ios/50/000000/humidity.png'}" alt="Humidity icon">
                        <span>Humidity: ${humidity}%</span>
                    </div>
                    <div class="weather-item">
                        <img src="${weatherIcons['wind']}" alt="Wind icon">
                        <span>Wind Speed: ${windSpeed} m/s</span>
                    </div>
                `;
                weatherResult.classList.add('active');

                // Fetch hourly forecast
                fetchHourlyForecast(city);
            }
        })
        .catch(error => {
            weatherResult.innerHTML = 'Error fetching weather data.';
            console.error(error);
        });

    cityInput.value = '';
}

function fetchHourlyForecast(city) {
    fetch(`${forecastApiUrl}${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === '404') {
                forecastContainer.innerHTML = 'Forecast not available.';
            } else {
                // Take the first 5 forecast entries (3-hour intervals)
                const forecastItems = data.list.slice(0, 5);
                forecastItems.forEach(item => {
                    const time = new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                    const temp = item.main.temp;
                    const condition = item.weather[0].main.toLowerCase();
                    const iconUrl = weatherIcons[condition] || weatherIcons['clouds']; // Fallback to clouds

                    const forecastItem = document.createElement('div');
                    forecastItem.classList.add('forecast-item');
                    forecastItem.innerHTML = `
                        <span>${time}</span>
                        <img src="${iconUrl}" alt="${condition}">
                        <span>${temp}°C</span>
                        <span>${condition.charAt(0).toUpperCase() + condition.slice(1)}</span>
                    `;
                    forecastContainer.appendChild(forecastItem);
                });
            }
        })
        .catch(error => {
            forecastContainer.innerHTML = 'Error fetching forecast data.';
            console.error(error);
        });
}