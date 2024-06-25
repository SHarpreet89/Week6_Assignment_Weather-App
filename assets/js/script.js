let searchedCities = JSON.parse(localStorage.getItem("cities")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

const searchForm = $('#search-form');
const searchButton = searchForm.find('#searchCity');
const cityToSearch = searchForm.find('#cityInput'); 
const countryToSearch = searchForm.find('#cityCountry'); 
const searchHistory = $('#searchHistory');

searchButton.on('click', function(event) {
    event.preventDefault(); // Prevent the default form submission
    const city = cityToSearch.val();
    const country = countryToSearch.val();
    fetchLocationCoordinates(city, country)
        .then(locationCoordinates => {
            const locationLat = locationCoordinates.lat;
            const locationLon = locationCoordinates.lon;
            fetchCurrentWeather(locationLat, locationLon);
            storeHistory(city, locationLat, locationLon);
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
        });
});

const fetchLocationCoordinates = function(city, country = '') {
    const coordinateURL = `https://nominatim.openstreetmap.org/search?q=${city},${country}&format=json&addressdetails=1`;

    return fetch(coordinateURL)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                throw new Error('Location not found');
            }
            console.log("Location Data is:", data);
            return {
                lat: data[0].lat,
                lon: data[0].lon 
            };
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
            throw error;
        });
};

const fetchCurrentWeather = function(lat, lon) {
    const weatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=7&appid=95e9805715f1a62ae0968c585998315f`;

    fetch(weatherURL)
        .then(response => response.json())
        .then(data => {
            console.log('Weather data:', data);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
};

function storeHistory(cityName, lat, lon) {
    if (searchedCities.length > 9) {
        searchedCities.pop();
        removeCityFromSearchedList();
    }

    searchedCities.add({ cityName, lat, lon });
    addCityToSearchedList(cityName);

    localStorage.setItem("cities", JSON.stringify(searchedCities));
}

function addCityToSearchedList(cityName) {
    const cityButton = $('<button>').addClass('bg-palegrey d-block').text(cityName);
    searchHistory.append(cityButton);
}

function removeCityFromSearchedList() {
    searchHistory.find('button').last().remove();
}

$(document).ready(function() {
        if (searchedCities.length > 0) {
            fetchCurrentWeather(searchedCities[0].lat, searchedCities[0].lon); // Fetch weather data only for the first city
            searchedCities.forEach(city => {
            addCityToSearchedList(city.cityName);
            });
        }
});
