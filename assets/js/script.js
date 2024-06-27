let searchedCities = JSON.parse(localStorage.getItem("cities")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

const searchForm = $('#search-form');
const searchButton = searchForm.find('#searchCity');
const cityToSearch = searchForm.find('#cityInput');
const countryToSearch = searchForm.find('#cityCountry');
const searchHistory = $('#searchHistory');
const mainWeatherDisplay = $('#weatherDisplayMain');
const secondaryWeatherDisplay = $('#weatherDisplaySecondary');
const mainWeatherInfo =$('#mainWeatherInfo')
const mainWeatherIcon = $('#mainWeatherIcon');

searchHistory.on('click', 'button', function(event) {
    const cityIndex = $(this).index();
    const city = searchedCities[cityIndex];
    fetchAndDisplayWeather(city);
    storeHistory(city);
});

searchButton.on('click', function(event) {
    event.preventDefault(); // Prevent the default form submission
    const cityName = cityToSearch.val();
    const country = countryToSearch.val();

    fetchLocationCoordinates(cityName, country)
        .then(locationCoordinates => {
            const city = {
                cityName,
                country,
                lat: locationCoordinates.lat,
                lon: locationCoordinates.lon
            };
            fetchAndDisplayWeather(city);
            storeHistory(city);
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
        });
});

function fetchAndDisplayWeather(city) {
    fetchCurrentWeather(city.cityName, city.country)
        .then(cityCurrentWeather => {
            displayCurrentWeatherInformation(city, cityCurrentWeather);
        });
    fetchFutureWeather(city.lat, city.lon)
        .then(cityFutureWeather => {
            displayFutureWeatherInformation(city, cityFutureWeather);
        });
}

const fetchCurrentWeather = function(cityName, country = '') {
    return fetchLocationCoordinates(cityName, country)
        .then(location => {
            const countryCode = location.countryCode || '';
            const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName},${countryCode}&appid=95e9805715f1a62ae0968c585998315f`;
            return fetch(currentWeatherURL);
        })
        .then(response => response.json())
        .then(data => {
            console.log('Current Weather data:', data);
            return data;
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            throw error;
        });
};

const fetchLocationCoordinates = function(cityName, country = '') {
    const coordinateURL = `https://nominatim.openstreetmap.org/search?q=${cityName},${country}&format=json&addressdetails=1`;

    return fetch(coordinateURL)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                throw new Error('Location not found');
            }
            console.log("Location Data is:", data);
            return {
                lat: data[0].lat,
                lon: data[0].lon,
                countryCode: data[0].address.country_code || ''
            };
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
            throw error;
        });
};

const fetchFutureWeather = function(lat, lon) {
    const futureWeatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&&appid=95e9805715f1a62ae0968c585998315f`;

    return fetch(futureWeatherURL)
        .then(response => response.json())
        .then(data => {
            console.log('Future Weather data:', data);
            return data;
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            throw error;
        });
};

function storeHistory(city, index = null) {
    if (index !== null) {
        removeCityFromSearchedList(index);
    } else if (searchedCities.length > 9) {
        removeCityFromSearchedList(9);
    }
    addCityToSearchedList(city);
}

function addCityToSearchedList(city) {
    searchedCities.unshift(city);
    localStorage.setItem("cities", JSON.stringify(searchedCities));
    renderHistoryList();
}

function removeCityFromSearchedList(index) {
    searchedCities.splice(index, 1);
    localStorage.setItem("cities", JSON.stringify(searchedCities));
    renderHistoryList();
}

function displayCurrentWeatherInformation(city, cityCurrentWeather) {
    
    const countryName = city.country || cityCurrentWeather.sys.country || '';
    const currentDate = new Date(cityCurrentWeather.dt * 1000).toISOString().split('T')[0];
    const cityTitle = $('<div>').addClass('h1 mainCountryInfo mt-3').html(`${city.cityName} <span class="h3">(${currentDate}) <br><span class="h4">${countryName}</span>`);
    const currentTemp = $('<div>').addClass('h3').text((cityCurrentWeather.main.temp - 273.15).toFixed(2) + ' °C');
    const currentWind = $('<div>').addClass('h3').text(`Wind: ${cityCurrentWeather.wind.speed} m/s`);
    const currentHumidity = $('<div>').addClass('h3').text(`Humidity: ${cityCurrentWeather.main.humidity}%`);
    mainWeatherInfo.empty().append(cityTitle, currentTemp, currentWind, currentHumidity);

    const iconUrl = `http://openweathermap.org/img/wn/${cityCurrentWeather.weather[0].icon}.png`;
    const weatherIcon = $('<img>').attr('src', iconUrl).addClass('weather-icon').css({ 'height': '150px', 'width': '150px' });
    mainWeatherIcon.empty().append(weatherIcon)
}


function displayFutureWeatherInformation(city, cityFutureWeather) {
    secondaryWeatherDisplay.empty();

    // Create an array to store unique dates
    let dates = [];
    let count = 0;
    let today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < cityFutureWeather.list.length && count < 5; i++) {
        const forecast = cityFutureWeather.list[i];
        const date = forecast.dt_txt.split(' ')[0];

        // Skip todays date data as this is already obtained from the fetchCurrentWeather
        if (date === today) continue;

        // Skip if the date is already in the array (this ensures we only take the first forecast of each day)
        if (!dates.includes(date)) {
            dates.push(date);
            count++;

            const iconUrl = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
            
            const futureWeatherCard = $('<div>').addClass('card project-card').css('width', '19%');
            const cardTitle = $('<div>').addClass('card-header h4').text(date);
            const futureWeatherCardBody = $('<div>').addClass('card project-card bg-transparent').css('width: 100%', 'Height: 100%');
            const weatherIcon = $('<img>').attr('src', iconUrl).addClass('weather-icon').css({ 'height': '75px', 'width': '75px' });
            const currentTemp = $('<div>').addClass('card-content h5').text((forecast.main.temp - 273.15).toFixed(2) + ' °C');
            const currentWind = $('<div>').addClass('p').text(`Wind: ${forecast.wind.speed} m/s`);
            const currentHumidity = $('<div>').addClass('p').text(`Humidity: ${forecast.main.humidity}%`);
            console.log(date, ((forecast.main.temp - 273.15).toFixed(2) + ' °C'), (`Humidity: ${forecast.main.humidity}%`), (`Wind: ${forecast.wind.speed} m/s`));

            futureWeatherCardBody.append(weatherIcon, currentTemp, currentWind, currentHumidity);
            futureWeatherCard.append(cardTitle, futureWeatherCardBody);

            // Append the card to the correct lane
            secondaryWeatherDisplay.append(futureWeatherCard);
        }
    }
}

function renderHistoryList() {
    searchHistory.empty();
    searchedCities.forEach(city => {
        const cityButton = $('<button>').addClass('d-block btn btn-info centered-button').text(city.cityName);
        searchHistory.append(cityButton);
    });
}

$(document).ready(function() {
    if (searchedCities.length > 0) {
        fetchAndDisplayWeather(searchedCities[0]);
        renderHistoryList();
    }
});
