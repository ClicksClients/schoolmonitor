document.getElementsByTagName("body")[0].style.backgroundImage = `url('./wallpapers/${Math.floor(Math.random() * 29)}.jpg')`

let config = {}

function setConfig() {
    config = JSON.parse(this.responseText)
}
var oReq = new XMLHttpRequest();
oReq.addEventListener("load", setConfig);
oReq.open("GET", "./config.json");
oReq.send();


let news = []
let weather = {}

//updates the time and date
const updateTime = () => {
    let today = new Date();
    let curtime = today.getHours() + ":" + (today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes());
    document.getElementById('time').innerHTML = curtime;

    let suffix;
    switch (today.getDate()) {
        case 1:
        case 21:
        case 31:
            suffix = "st";
            break;
        case 2:
        case 22:
            suffix = "nd";
            break;
        case 3:
        case 23:
            suffix = "rd";
            break;
        default:
            suffix = "th";
            break;
    }

    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    let curdate = `${days[today.getDay()]} ${today.getDate()}${suffix} ${months[today.getMonth()]} ${today.getFullYear()}`
    document.getElementById('date').innerHTML = curdate;

    // Update the clock
    var hands = [document.getElementById("secondhand"), document.getElementById("minutehand"), document.getElementById("hourhand")],
        initDeg = [6 * today.getSeconds(), 6 * today.getMinutes(), 30 * (today.getHours() % 12) + today.getMinutes() / 2];
    for (var i = 0; i < hands.length; i++) {
        var stepper = i == 0 ? 60 : 0;
        var animate = hands[i].animate([
            { transform: 'rotate(' + initDeg[i] + 'deg)' },
            { transform: 'rotate(' + (initDeg[i] + 360) + 'deg)' }
        ], {
            duration: 1000 * Math.pow(34, i + 1),
            easing: 'ease',
            iterations: 10
        });
    }

}

//updates the week and period
const updatePeriod = () => {

    let pTimes = {
        830: "Form 1",
        900: "Period 1",
        950: "Break",
        1010: "Period 2",
        1100: "Form 2",
        1120: "Period 3",
        1210: "Lunch",
        1240: "Period 4",
        1330: "Form 3",
        1400: "Period 5",
        1450: "Home",
        2400: "Tomorrow"
    }
    document.getElementById('week').innerHTML = "Week " + config.week;

    let d = new Date();
    let curtime = d.getHours() * 100 + d.getMinutes();
    let times = Object.keys(pTimes)
    let nextperiod;
    for (let time in pTimes) {
        if (curtime < time) {
            nextperiod = time;
            break;
        }
    }
    let t = nextperiod - curtime
    t *= 10/6
    document.getElementById('period').innerHTML = `${pTimes[nextperiod]} starts in ${Math.round(t)} minutes`
}

//updates the next event
const updateEvent = () => {
    let eventdate = new Date(config.nextEvent[0]);
    let today = new Date();

    let timeBetween = eventdate.getTime() - today.getTime();
    let daysBetween = Math.floor(timeBetween / 86400000)

    document.getElementById('eventdays').innerHTML = `${daysBetween} Days`
    document.getElementById('event').innerHTML = `until ${config.nextEvent[1]}`
}

//updates Notices
const updateNotices = () => {
    let notices = config.notices.map(notice => {
        return `<div><span class="icon material-icons">${notice.icon}</span><p class="noticeText">${notice.description}</p></div>`
    })
    document.getElementById('notices').innerHTML = notices.join('');
}

const updateWotW = () => {
    document.getElementById('word').innerHTML = `${config.wotw.word}`
    document.getElementById('type').innerHTML = `<b>Type: </b> ${config.wotw.type}`
    document.getElementById('definition').innerHTML = `<b>Definition: </b> ${config.wotw.definition}`
    document.getElementById('example').innerHTML = `<b>Example in context: </b> "${config.wotw.example}"`
}

let article = 0
const updateArticle = () => {
    let scroll = document.getElementById("footer");
    let prev = document.getElementsByClassName("newsScroll")[0];
    prev.classList.add("after")
    let next = document.createElement("SPAN");
    next.innerHTML = news[article];
    next.classList.add("newsScroll");
    next.classList.add("scrollbefore");
    scroll.appendChild(next);
    next.classList.remove("scrollbefore");


    prev.remove()

    article += 1;
    if (article >= news.length) { article = 0; }
}

const updateWeather = () => {
    var name = "clear"
    if (weather.current.condition.text.includes("cloud")) { name = "cloud" }
    else if (weather.current.condition.text.includes("thunder")) { name = "thunder" }
    else if (weather.current.condition.text.includes("rain") || weather.current.condition.text.includes("drizzle")) { name = "rain" }
    else if (weather.current.condition.text.includes("snow")) { name = "snow" }

    let icons = {
        clear: "./assets/sun.svg",
        cloud: "./assets/cloudy.svg",
        thunder: "./assets/lightning.svg",
        rain: "./assets/rain.svg",
        snow: "./assets/snow.svg"
    }
    function setWeather() {
        let weatherIcon = document.getElementsByClassName("weatherIcon")[0]
        weatherIcon.innerHTML = this.responseText
        weatherIcon.children[0].id = "weatherIcon"
    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", setWeather);
    oReq.open("GET", icons[name]);
    oReq.send();

    let condition = document.getElementById("condition")
    condition.innerHTML = weather.current.condition.text
    condition = document.getElementById("subtext")
    let w = `There is a ${weather.forecast.forecastday[0].day.daily_chance_of_rain}% chance of rain today`

    if (weather.alerts.alert.length) {
        let e = document.getElementsByClassName("b")[0]
        e.style["border-left"] = "#F2D478 40px solid"
        w += `<br />${weather.alerts.alert[0].headline}`
    }
    condition.innerHTML = w
}




//all setIntervals
setInterval(updateTime, 1000)
setInterval(updatePeriod, 1000);
setInterval(updateEvent, 1000);
setInterval(updateNotices, 1000);
setInterval(updateWotW, 1000);

function reqNews() {
    news = JSON.parse(this.responseText).articles.map(article => {
        return article.title
    })
    updateArticle()
    setInterval(updateArticle, 10000);
}

function reqWeather() {
    weather = JSON.parse(this.responseText)
    updateWeather()
    setInterval(updateWeather, 100000);
}

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqNews);
oReq.open("GET", "https://saurav.tech/NewsAPI/top-headlines/category/general/gb.json");
oReq.send();

var wReq = new XMLHttpRequest();
wReq.addEventListener("load", reqWeather);
wReq.open("GET", "https://api.weatherapi.com/v1/forecast.json?key=8a8496ce0f154a6d800132954211007&q=Stoke On Trent, England&days=1&aqi=no&alerts=yes");
wReq.send();
