var config = {
	BASE_URL: 'https://fcc-weather-api.glitch.me/',
	WEATHER_API: 'api/current',
	SEARCH_URL: 'https://maps.googleapis.com/maps/api/geocode/json',
};

var Utility = (function() {
	function makeAjaxRequest(url) {
		return $.ajax({
			url: url,
		});
	}
	return {
		ajaxRequest: makeAjaxRequest,
	};
})();

(function() {
	var WeatherApp = function(location, search) {
		this.location = location;
		this.search = search;
		this.init();
	};

	WeatherApp.prototype.init = function() {
		this.attachEvent();
	};

	WeatherApp.prototype.onCurrentPositionResponse = function(position) {
		var URL = `${config.BASE_URL}${config.WEATHER_API}?lat=${position.coords
			.latitude}&lon=${position.coords.longitude}`;

		this.makeAjaxRequest(URL);
	};

	WeatherApp.prototype.makeAjaxRequest = function(URL) {
		Utility.ajaxRequest(URL)
			.done(this.handleResponse.bind(this))
			.fail(function(err) {
				console.log('Error: ' + err.status);
			});
	};

	WeatherApp.prototype.handleResponse = function(data) {
		this.responseData = data;

		this.faren = Math.round(data.main.temp * 9 / 5 + 32);
		this.celcius = data.main.temp;

		var temp = `<div class = 'current-location'>\
									<strong class='location-head'>Location: </strong> 
									<span class='location-name'>${data.name}</span>\
								</div>\
								<div class = 'temperature'>\
									<strong class='location-head'>Current Temperature: </strong>\
									<span class = 'temp-celcius '>\
										${this.celcius}\
										<span class = 'degree'>&#8451;</span>\
									</span>\
									<span class='temp-farenheit hide'>\
										${this.faren}\
										<span class = 'degree'>&#8457;</span>\
									</span>\
								</div>\
								<div class = 'image'>\
									<img src=" ${data.weather[0].icon}"></img>\
								</div>`;

		this.location.html(temp);
	};

	WeatherApp.prototype.attachEvent = function() {
		this.location.on('click', '.degree', this.handleClick.bind(this));
		this.search.on('click', '.search-button', this.handleSearchClick.bind(this));
		this.search.on('click', '.auto-button', this.handleCurrentLocation.bind(this));
		this.search.on('keypress', '.pincode-text', this.handleKeyPress.bind(this));
	};

	WeatherApp.prototype.handleCurrentLocation = function() {
		navigator.geolocation.getCurrentPosition(this.onCurrentPositionResponse.bind(this));
		this.search.find('.pincode-text').val('');
	};

	WeatherApp.prototype.handleClick = function() {
		this.location.find('.temp-celcius').toggleClass('hide');
		this.location.find('.temp-farenheit').toggleClass('hide');
	};

	WeatherApp.prototype.handleKeyPress = function(event) {
		if (event.keyCode === 13) {
			this.handleSearchClick();
		}
	};

	WeatherApp.prototype.handleSearchClick = function() {
		const pincodeValue = this.search.find('.pincode-text').val();
		const URL = `${config.SEARCH_URL}?address=${pincodeValue}`;
		this.searchAjaxRequest(URL);
	};

	WeatherApp.prototype.searchAjaxRequest = function(URL) {
		Utility.ajaxRequest(URL)
			.done(response => {
				if (response.results.length > 0) {
					const latitude = response.results[0].geometry.location.lat;
					const longitude = response.results[0].geometry.location.lng;
					var weatherUrl = `${config.BASE_URL}${config.WEATHER_API}?lat=${latitude}&lon=${longitude}`;
					this.makeAjaxRequest(weatherUrl);
				} else {
					var errorMsg = `<div class='error-msg'>No match found.Please enter valid pincode</div>`;
					this.location.html(errorMsg);
				}
			})
			.fail(function(err) {
				console.log('Error: ' + err.status);
			});
	};

	window.WeatherApp = WeatherApp;
})();

(function() {
	new WeatherApp($('#currLocation'), $('.search-container'));
})();
