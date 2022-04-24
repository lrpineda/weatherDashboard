let recentSearches = [];
let oldSearchEl = document.querySelector("#recentSearches");
let apiForcast = "https://api.openweathermap.org/data/2.5/onecall?";
let apiCurrent = "https://api.openweathermap.org/data/2.5/weather?q=";
let daysAmount = "&cnt=5";
let unitTemp = "&units=imperial";

let saveSearch = function (city) {
    if (!recentSearches.includes(city)) {
        recentSearches.push(city);
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    }
    
    
}

let buttonClickHandler = function (event) {
    var city = event.target.getAttribute("search");

    if (city) {
        getGeoLocation(city);

        clearForcast();
    };
};

let setRecentSearches = function () {
    $("#recentSearches").empty();
    for (let i = recentSearches.length-1; i >= 0; i--) {
        let recentSearch = $("<li>")
            .addClass("p-2 old-search");
        let search = $("<button>")
            .addClass("button is-large is-fullwidth is-link is-light")
            .attr("search", recentSearches[i])
            .text(recentSearches[i]);
        recentSearch.append(search);
        $("#recentSearches").append(recentSearch);
    }
};

let loadRecentSearches = function () {
    
    recentSearches = JSON.parse(localStorage.getItem("recentSearches"));
    if (!recentSearches) {
        recentSearches = [];
    };
    
    setRecentSearches();

}

let getGeoLocation = function (city) {
    let apiKey = "&appid=312bd3bcab3e029ce9a7fadd43d5e2e5";
    let cityName = city;
    $("#input-city").val("");
    clearForcast();
    
  fetch(apiCurrent + city + apiKey).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        forcast(city, data.coord);
        saveSearch(cityName);
      });
    } else {
      throw new Error("Request failed, status: " + response.statusText);
    }
  });
};

let forcast = function (city, coordinates) {
  let apiKey = "&appid=312bd3bcab3e029ce9a7fadd43d5e2e5";
  fetch(
    apiForcast +
      "lat=" +
      coordinates.lat +
      "&lon=" +
      coordinates.lon +
      daysAmount +
      unitTemp +
      apiKey +
      "&exclude=minutely,hourly"
  ).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        displayForcast(city, data);
      });
    } else {
      throw new Error("Request failed, status: " + response.statusText);
    }
  });
};

let clearForcast = function () {
    $("#today").remove();
    loadRecentSearches();
};


let displayForcast = function (city, data) {
    // Creating Today's Forcast elements
    let todayDate = moment.utc(data.current.dt*1000).format("MM/DD/YYYY");
    let Newcity = city.charAt(0).toUpperCase() + city.slice(1);
    let todayForcastDiv = $("<div>")
        .addClass("tile is-child notification is-info is-light")
        .attr("id", "today");
    let cityEl = $("<span>").addClass("icon-text");
    let tfCity = $("<span>").addClass("pt-1 title").text(Newcity+"  ("+todayDate+")");
    
    let tfTemp = $("<p>")
        .addClass("subtitle")
        .text("Temperature: " + data.current.temp + " °F");
    let tfWind = $("<p>")
        .addClass("subtitle is-5")
        .text("Wind Speed: " + data.current.wind_speed + " mph");
    let tfHumidity = $("<p>")
        .addClass("subtitle is-5")
        .text("Humidity: " + data.current.humidity + "%");
    let tfUV = $("<p>")
        .addClass("subtitle is-5")
        .text("UV Index: ");
    let uvIndex = $("<span>").addClass("tag")
        .text(data.current.uvi);
    if (data.current.uvi <= 2) {
        uvIndex.addClass("is-success");
    } else if (data.current.uvi <= 4) {
        uvIndex.addClass("is-warning");
    } else {
        uvIndex.addClass("is-danger");
    };
    let iconEl = $("<span>").addClass("icon is-large");
    let tfIcon = $("<img>")
        .attr("src", "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png");
    iconEl.append(tfIcon)
    cityEl.append(tfCity, iconEl);
    tfUV.append(uvIndex);
    todayForcastDiv.append(cityEl, tfTemp, tfWind, tfHumidity, tfUV);
    $("#forecast").append(todayForcastDiv);
   

    let forcastEl = $("<article>")
    .addClass("level tile is-ancestor");

    let forecastTitle = $("<div>")
        .addClass("title is-3 has-text-centered p-3")
        .text("5-Day Forcast");

    $("#today").append(forecastTitle);

    // Creating Forcast elements
    for (let i = 1; i < 6; i++) {
        let forcastDate = moment.utc(data.daily[i].dt*1000).format("MM/DD/YYYY");
        let forcastDiv = $("<div>")
            .addClass("level-item has-text-centered tile is-parent ");
        let forcastBox = $("<div>")
            .addClass("tile is-child box fCard");
        let fDate = $("<p>")
            .addClass("title is-5")
            .text(forcastDate);
        let fIcon = $("<img>")
            .attr("src", "http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + "@2x.png");
        let fIconEl = $("<span>").addClass("pt-2 icon is-large");
        fIconEl.append(fIcon);
        let fTemp = $("<p>")
            .addClass("pt-1 has-text-left")
            .text("Temp: " + data.daily[i].temp.day + " °F");
        let fWind = $("<p>")
            .addClass("pt-1 has-text-left")
            .text("Wind: " + data.daily[i].wind_speed + " mph");
        let fHumidity = $("<p>")
            .addClass("pt-1 has-text-left")
            .text("Humidity: " + data.daily[i].humidity + "%");

        
        forcastBox.append(fDate, fIconEl, fTemp, fWind, fHumidity);
        forcastDiv.append(forcastBox);
        forcastEl.append(forcastDiv);
        $("#today").append(forcastEl);
        
    }
    
};

loadRecentSearches();

$("#search-btn").on("click", function () {
  let city = $("#input-city").val();
  getGeoLocation(city);
});

oldSearchEl.addEventListener("click", buttonClickHandler);

