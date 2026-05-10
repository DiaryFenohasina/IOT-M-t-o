const switchLatLong = (lat: number = 52.52, long: number = 13.41) => {
    return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`
}


export const fetchWeatherData = async (lat: number = 52.52, long: number = 13.41) => {
    try {
        const response = await fetch(switchLatLong(lat, long));
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

