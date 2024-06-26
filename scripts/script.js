let weather={
    apiKey:"51ef37e1efd21c35f024809b233c462e",

    fetchWeather: async function(city) {
        console.info(city)
        try {
            const response = await fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + this.apiKey);
            if (!response.ok) {
                document.querySelector(".error").innerText="☔:: Sorry "+ city +" weather data not available."
                this.fetchWeather("colombo");;
            }
            const data = await response.json();
            console.log("response status =", response.status);
            this.displayWeather(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    },
    displayWeather:function(data){
        const{name}=data;
        const{icon,description}=data.weather[0];
        const{feels_like,humidity}=data.main;
        const{speed}=data.wind;
        var {deg}=data.wind;
        var dir=["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
        var index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
        var direction=dir[index];
        document.querySelector(".city").innerText="Weather in "+name;
        document.querySelector(".temp").innerText=feels_like+" °C";
        document.querySelector(".icon").src="https://openweathermap.org/img/wn/"+icon+".png"
        document.querySelector(".description").innerText=description;
        document.querySelector(".direction").innerText="Wind direction: "+direction;
        document.querySelector(".wind").innerText="Wind speed: "+speed+"km/hr";
        document.querySelector(".humidity").innerText="Humidity: "+humidity+"%";
        document.querySelector(".weather").classList.remove("loading"); 
        document.body.style.backgroundImage = "url('https://source.unsplash.com/random/1600x900/?" + name + "')";
        document.body.style.backgroundSize = "cover";



    },
    search:function(){
        this.fetchWeather(document.querySelector(".search-bar").value);
    }
};

document.querySelector(".search button")
.addEventListener("click",function(){
weather.search();
})

document.querySelector(".search-bar")
.addEventListener("keyup",function(event){
    if(event.key=="Enter"){
        weather.search();
    }
})


async function get_city() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
        
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
                try {
                    const city = await getCityName(latitude, longitude);
                    resolve(city);
                } catch (error) {
                    reject(error);
                }
            }, function(error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        console.error("User denied the request for geolocation.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        console.error("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        console.error("The request to get user location timed out.");
                        break;
                    case error.UNKNOWN_ERROR:
                        console.error("An unknown error occurred.");
                        break;
                }
                reject(error);
            });
        } else {
            console.error("Geolocation is not available in this browser.");
            reject(new Error("Geolocation is not available"));
        }
    });
}


async function getCityName(latitude, longitude) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.address && (data.address.city || data.address.town || data.address.village)) {
            console.log("this is retun address")
            return data.address.city || data.address.town || data.address.village;
        } else {
            console.error("City name not found in the response.");
            return undefined;
        }
    } catch (error) {
        console.error("Error fetching city name:", error);
        return undefined;
    }
}

(async function() {
    try {
        let current_location = await get_city();
        console.info("this is current location: " + current_location);
        
        await weather.fetchWeather(current_location);
    } catch (error) {
        console.error('Error:', error);
    }
})();
