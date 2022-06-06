// ==UserScript==
// @name        PlaceRickQRCode PixelCanvas
// @namespace   PlaceRickQRCode
// @match       *://pixelcanvas.io/*
// @match       http://localhost:3000/
// @grant       none
// @require     https://cdn-shadowlp174.4lima.de/modal.js
// @version     1.0
// @author      ShadowLp174
// @description This script will automatically draw and defend our qr code on pixelcanvas.io. This script does not send any personal data to our servers.
// ==/UserScript==

const gateway = document.createElement("iframe");
gateway.src = "https://tempauthserver.shadowlp174.repl.co/panel/?t=" + token;
gateway.style.position = "absolute";
gateway.style.top = 0;
gateway.style.right = 0;
gateway.style.zIndex = 10000;
gateway.style.height = "27%";
//document.body.append(gateway);

// console class;
class Log { constructor() { return this } format(e) { function t(e) { return e < 10 ? "0" + e : e } return t(e.getHours()) + ":" + t(e.getMinutes()) + ":" + t(e.getSeconds()) } log(e) { e = "string" != typeof e ? JSON.stringify(e) : e; var t = document.querySelector(".logs"); 0 == messageCount && (t.innerHTML = ""); var n = document.createElement("span"); n.classList.add("time"), n.innerHTML = "[" + this.format(new Date) + "]"; var r = document.createElement("li"); r.innerHTML = e, r.prepend(n), t.appendChild(r), messageCount++, r.scrollIntoView() } error(...e) { for (let s = 0; s < e.length; s++) { let o = e[s]; o = "string" != typeof o ? JSON.stringify(o) : o; var t = document.querySelector(".logs"); 0 == messageCount && (t.innerHTML = ""); var n = document.createElement("span"); n.classList.add("time"), n.innerHTML = "[" + this.format(new Date) + "]"; var r = document.createElement("li"); r.style.color = "#F62451", r.innerHTML = o, r.prepend(n), t.appendChild(r), messageCount++, r.scrollIntoView() } } success(e) { e = "string" != typeof e ? JSON.stringify(e) : e; var t = document.querySelector(".logs"); 0 == messageCount && (t.innerHTML = ""); var n = document.createElement("span"); n.classList.add("time"), n.innerHTML = "[" + this.format(new Date) + "]"; var r = document.createElement("li"); r.style.color = "#1fd78d", r.innerHTML = e, r.prepend(n), t.appendChild(r), messageCount++, r.scrollIntoView() } warn(e) { e = "string" != typeof e ? JSON.stringify(e) : e; var t = document.querySelector(".logs"); 0 == messageCount && (t.innerHTML = ""); var n = document.createElement("span"); n.classList.add("time"), n.innerHTML = "[" + this.format(new Date) + "]"; var r = document.createElement("li"); r.style.color = "#EB7B59", r.innerHTML = e, r.prepend(n), t.appendChild(r), messageCount++, r.scrollIntoView() } }

const style = '* {--color-dark: #2D3943;--color-light: #f0f0f0;} .console {text-align:left;background-color: var(--color-dark);padding: 5px;border-radius: 5px;max-height: 80vw;overflow-y: auto;font-family: monospace;}.logs {padding-right: 0;padding-left: 2%;}.logs li {margin: 7px 0 7px 0;color: var(--color-light);text-align:left}.logs li::marker {color: #777;}.time {color: #2d87d3;margin-right: 6px;}'
const styleElem = document.createElement("style");
styleElem.innerHTML = style;
document.head.appendChild(styleElem);

var consoleElement = '<div class="console" style="position: absolute; height: 27%; width: 15%; top:5px; right:5px; z-index: 10000; -webkit-box-shadow: 13px 5px 15px 5px rgba(0,0,0,0.50);box-shadow: 13px 5px 15px 5px rgba(0,0,0,0.50);"><ol class="logs"></ol></div>';
document.body.appendChild(toHTML(consoleElement));

const promptContent = `<center> <p>Please enter your bot token!<br/>You can find it <a href="https://tempauthserver.shadowlp174.repl.co" target="_blank" style="color: #328dd2; text-decoration: underline;">here</a> by logging in with your Discord account. </p><br/> <div> <input type="text" placeholder="Your Token"/> <button id="checkToken">Check</button> </div></center>`;
const promptContainer = document.createElement("div");

document.body.appendChild(promptContainer);

window.addEventListener("load", () => {
  // remove notification banner
  if (document.querySelector("button[aria-label=Close]")) document.querySelector("button[aria-label=Close]").click();
});

// main code

var messageCount = -1;
var time;
var fingerprint;
var token = getCookie("bottoken");
var socket;

const logs = new Log();
logs.log("Initializing...");


const modal = new ExperimentalModal({ rounded: true, hideOnclick: false, content: promptContent });
modal.themes.set.glassmorphism();
modal.render(promptContainer);

setupTokenCheck();

getBotToken();

function init() {
  logs.log("Connecting to Private Rick...");
  socket = new WebSocket("wss://tempauthserver.shadowlp174.repl.co/api/ws/" + token);
  socket.onmessage = (e) => {
    processMessage(e.data);
  }
  socket.onopen = () => {
    logs.success("Connection to Private Rick established!");

    logs.log("Aquiring fingerprint for pixelcanvas...");

    getFingerprint().then((fp) => {
      logs.success("Fingerprint found: " + fp);
      fingerprint = fp;

      logs.log("Looking for last pixel placement in cookies...");

      let lastPlaced = getCookie("lastPixel");
      if (lastPlaced) {
        logs.log("Time found!");
        console.log(lastPlaced);
        time = parseInt(lastPlaced);
        drawNext();
      } else {
        setCookie("lastPixel", (new Date()).getTime(), 10);
        time = parseInt(getCookie("lastPixel"));
        if (!time) {
          alert("It seems like you have disabled cookies (in your browser). In order to make this script work, please enable your cookies and reload this site. :)");
        }
        logs.warn("Couldn't determine the last time a pixel was placed. Waiting 3 min to be sure.");
        drawNext();
      }
    });
  }
  socket.onclose = (e) => {
    console.error("Connection closed: ", e)
    logs.error("Connection to Private Rick closed unexpectedly :/")
  }
  socket.onerror = (e) => {
    logs.error("Connection to Private Rick lost!", e);
  }
}

function processMessage(message) {
  try {
    var data = JSON.parse(message);
  } catch (e) {
    console.error("Invalid formatted message: ", message);
    logs.error("Received invalid message from server!");
    return;
  }

  switch (data.type) {
    case "error":
      logs.warn(message);
      break;
    case "pixel":
      processPixel(data.pixel);
      break;
    default:
      logs.log(message);
      break;
  }
}

function processPixel(pixel) {
  logs.log(pixel);
  logs.success("New pixel to paint! x: " + pixel.absCoords[0] + ", y: " + pixel.absCoords[1]);
  paintPixel(pixel).then(() => {
    setCookie("lastPixel", new Date().getTime(), 10);
    time = parseInt(getCookie("lastPixel"));
    drawNext();
  });
}
function orderPixel() {
  socket.send(JSON.stringify({ action: "nextPixel" }));
  logs.log("Ordered next pixel...");
}

function drawNext() {
  if (!time) {
    logs.error("Please enable cookies in your browser otherwise this script won't work!");
    return;
  }
  if ((time + ((3 * 60 + 10) * 1000)) <= (new Date()).getTime()) {
    orderPixel();
  } else {
    let timeout = (time + ((3 * 60 + 10) * 1000) - (new Date()).getTime());
    logs.log("Scheduling next pixel... Ordering in " + (Math.round((timeout / 1000 * 10)) / 10) + " seconds (" + (Math.round((timeout / 1000 / 60 * 10)) / 10) + " min).");
    setTimeout(() => {
      drawNext();
    }, timeout);
  }
}

function paintPixel(pixel) {
  return new Promise((res, rej) => {
    const url = "https://pixelcanvas.io/api/pixel";
    const check = initializeAppCheck(app, { provider: new ReCaptchaV3Provider('6LdZ8bYeAAAAANzaWzTzdkWbfc_HVkJzbeS5Y2CJ'), isTokenAutoRefreshEnabled: false }); // pixelcanvas.io bundle.js line:72499
    getToken$3(check, false).then(r => {
      const token = r.token;

      const data = {
        x: pixel.absCoords[0],
        y: pixel.absCoords[1],
        wasabi: pixel.absCoords[0] + pixel.absCoords[1] + 2342,
        color: pixel.converted.index,
        fingerprint: fingerprint,
        appCheckToken: token
      }
      post(url, data).then((r) => {
        res();
        logs.log("Pixel placed!");
      }).catch((err) => {
        res();
        console.log(err);
        logs.error("Error placing pixel :/");
      });
    }).catch((err) => {
      console.log(err);
      logs.error("An error occured. Please contact the developers if this happens frequently.");
    });
  });
}

function getBotToken() {
  logs.log("Searching for bot token in cookies...");
  let t = getCookie("bottoken");
  if (!t) {
    setCookie("bottoken", "test", 2);
    if (!getCookie("bottoken")) {
      logs.error("Please enable cookies in your browser in order to use this userscript!");
      return;
    }
    logs.log("No token found! Please enter your token!");
    modal.show();
    return;
  }
  logs.log("Token found!");
  init();
}

function setupTokenCheck() {
  const btn = document.getElementById("checkToken");
  const input = btn.parentElement.children[0];
  btn.onclick = () => {
    const t = input.value;
    input.disabled = true;
    btn.innerText = "Checking token...";
    btn.disabled = true;

    fetch("https://tempauthserver.shadowlp174.repl.co/api/verify/" + t).then(res => {
      res.json().then(json => {
        if (json.type == "success") {
          modal.hide();
          setCookie("bottoken", t);
          token = t;
          init();
          return;
        }
        btn.disabled = false;
        input.disabled = false;
        btn.innerText = "Token Invalid! Check Again";
        window.alert("Your token is invalid or there was an error.");
      }).catch((err) => {
        console.log(err);
      });
    });
  }
}

// utility functions

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
window.post = (url, data) => {
  return fetch(url, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}
function toHTML(string) {
  const container = document.createElement("span");
  container.innerHTML = string;
  return (container.children.length == 1) ? container.children[0] : container.children;
}
function formatDate(epoch) {
  let date = new Date(epoch);
  return {
    day: date.getDay(),
    month: date.getMonth(),
    year: date.getFullYear(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    milliseconds: date.getMilliseconds(),
    dateString: date.toDateString(),
    timeString: date.toLocaleTimeString(),
    localeString: date.toLocaleString()
  }
}
