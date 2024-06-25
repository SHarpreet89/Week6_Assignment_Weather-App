const searchForm = $('#search-form');
const searchButton = searchForm.find('#searchCity');
const cityToSearch = searchForm.find('#cityInput'); 
const countryToSearch = searchForm.find('#cityCountry'); 

searchButton.on('click', function(event) {
    event.preventDefault(); // Prevent the default form submission
    const city = cityToSearch.val();
    const country = countryToSearch.val();
    fetchLocationCoordinates(city, country)
        .then(locationCoordinates => {
            const locationLat = locationCoordinates.lat;
            const locationLon = locationCoordinates.lon;
            fetchCurrentWeather(locationLat, locationLon);
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
        });
});

const fetchLocationCoordinates = function(city, country = '') {
    // Construct the URL with the provided city and country
    const coordinateURL = `https://nominatim.openstreetmap.org/search?q=${city},${country}&format=json&addressdetails=1`;

    // Fetch the data from the API
    return fetch(coordinateURL)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                throw new Error('Location not found');
            }
            else {
                console.log("Location Data is:")
                console.log(data)
                console.log("Lattitude and Longitude of the first or only city are:")
                const lat = data[0].lat;
                const lon = data[0].lon;
                console.log('Latitude:', lat);
                console.log('Longitude:', lon);
            }
            // Return the first result's coordinates
            return {
                lat: data[0].lat,
                lon: data[0].lon 
            };
        })
        .catch(error => {
            // Handle any errors that occur during the fetch
            console.error('Error fetching coordinates:', error);
            throw error;
        });
};

const fetchCurrentWeather = function(lat, lon) {
    // Construct the URL with the provided latitude and longitude
    const weatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=7&appid=95e9805715f1a62ae0968c585998315f`;

    // Fetch the data from the API
    fetch(weatherURL)
        .then(response => response.json())
        .then(data => {
            // Handle the weather data
            console.log('Weather data:', data);
        })
        .catch(error => {
            // Handle any errors that occur during the fetch
            console.error('Error fetching weather data:', error);
        });
};
