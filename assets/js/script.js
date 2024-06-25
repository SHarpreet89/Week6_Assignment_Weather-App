const searchForm = $('#search-form');
const searchButton = searchForm.find('#searchCity')
const cityToSearch = searchForm.find('#cityName') //Select the City
const countryToSearch = searchForm.find('#countryName') //Select the Country

searchButton.on('click', function(event) {
    event.preventDefault(); // Prevent the default form submission
    const city = cityToSearch.val();
    const country = countryToSearch.val();
    const locationCoordinates = fetchLocationCoordinates(city, country);
    const locationLat = locationCoordinates.lat;
    const locationLon = locationCoordinates.lon;
    fetchCurrentWeather (locationLat,locationLon);
});

const fetchLocationCoordinates = function (city, country = '') {
    // Construct the URL with the provided city and country
    const coordinateURL = `https://nominatim.openstreetmap.org/search?q=${city},${country}&format=json&addressdetails=1`;

    // Fetch the data from the API
    fetch(coordinateURL).then(function(data) {  
            console.log(data);
            return data;
        })
        .catch(error => {
            // Handle any errors that occur during the fetch
            console.error('Error fetching coordinates:', error);
        });
};


const fetchCurrentWeather = async (city) => {
    const apiKey = '95e9805715f1a62ae0968c585998315f';
    const requesturl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        fetch(requesturl).then(function(respone) {
        if (data.cod === 200) {
            console.log('Current Weather:', data);
            displayCurrentWeather(data);
        } else {
            console.error('Error:', data.message);
        }
    }
        catch (error) {
        console.error('Error fetching the weather data:', error);
        }
    }
};


