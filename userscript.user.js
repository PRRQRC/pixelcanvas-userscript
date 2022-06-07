// ==UserScript==
// @name        PlaceRickQRCode PixelCanvas
// @namespace   PlaceRickQRCode
// @match       *://pixelcanvas.io/*
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
class CommandHandler { constructor(a, b) { return this.commands = [], this.callbacks = [], this.prefix = a, this.error = b, this.history = [], this } addCommand(a, b) { this.commands.push(a), this.callbacks.push(b) } executeCommand(a, e) { let b = a.repeat(1); this.history.unshift(b); let c = this.prefix, f = a.replace(c, "").toLowerCase().split(" ").slice(1); a = a.replace(c, "").toLowerCase().split(" ")[0]; let d = this.commands.indexOf(a); if (-1 === d) { this.error(b, e); return } this.callbacks[d](f) } getHistory(a) { return a < 0 || a >= this.history.length ? null : this.history[a] } } class Log { constructor(a) { return this.container = document.querySelector(".console"), this.input = document.querySelector(".input"), this.input && (this.currentPos = 0, this.input.addEventListener("keyup", a => { 13 === a.keyCode && (this.currentPos = 0, this.processCommand(this.input.value), this.input.value = "") }), this.input.addEventListener("keyup", b => { if (38 === b.keyCode) { if (!this.commandHandler) return; let a = this.commandHandler; !(this.currentPos >= a.history.length) && (this.input.value = a.getHistory(this.currentPos), this.currentPos++) } }), this.input.addEventListener("keyup", a => { if (40 === a.keyCode) { if (!this.commandHandler) return; let b = this.commandHandler; this.currentPos <= 0 || (this.input.value = b.getHistory(--this.currentPos)) } })), this.commandHandler = a, this } processCommand(a) { if (!this.commandHandler || !a.startsWith(this.commandHandler.prefix)) { this.log(a); return } this.commandHandler.executeCommand(a, this) } format(a) { function b(a) { return a < 10 ? "0" + a : a } return b(a.getHours()) + ":" + b(a.getMinutes()) + ":" + b(a.getSeconds()) } log(a) { a = "string" != typeof a ? JSON.stringify(a) : a; var d = document.querySelector(".logs"); 0 == messageCount && (d.innerHTML = ""); var c = document.createElement("span"); c.classList.add("time"), c.innerHTML = "[" + this.format(new Date) + "]"; var b = document.createElement("li"); b.innerHTML = a, b.prepend(c), d.appendChild(b), messageCount++, b.scrollIntoView() } error(...e) { for (let c = 0; c < e.length; c++) { let a = e[c]; a = "string" != typeof a ? JSON.stringify(a) : a; var f = document.querySelector(".logs"); 0 == messageCount && (f.innerHTML = ""); var d = document.createElement("span"); d.classList.add("time"), d.innerHTML = "[" + this.format(new Date) + "]"; var b = document.createElement("li"); b.style.color = "#F62451", b.innerHTML = a, b.prepend(d), f.appendChild(b), messageCount++, b.scrollIntoView() } } success(a) { a = "string" != typeof a ? JSON.stringify(a) : a; var d = document.querySelector(".logs"); 0 == messageCount && (d.innerHTML = ""); var c = document.createElement("span"); c.classList.add("time"), c.innerHTML = "[" + this.format(new Date) + "]"; var b = document.createElement("li"); b.style.color = "#1fd78d", b.innerHTML = a, b.prepend(c), d.appendChild(b), messageCount++, b.scrollIntoView() } warn(a) { a = "string" != typeof a ? JSON.stringify(a) : a; var d = document.querySelector(".logs"); 0 == messageCount && (d.innerHTML = ""); var c = document.createElement("span"); c.classList.add("time"), c.innerHTML = "[" + this.format(new Date) + "]"; var b = document.createElement("li"); b.style.color = "#EB7B59", b.innerHTML = a, b.prepend(c), d.appendChild(b), messageCount++, b.scrollIntoView() } }

const style = '*{--color-dark:#2D3943;--color-light:#f0f0f0}.console{background-color:var(--color-dark);padding:5px;border-radius:5px;max-height:80vw;overflow-y:auto;font-family:monospace;display:flex;flex-direction:column}.logs{padding-right:0;padding-left:2%}.logs li{margin:7px 0 7px 0;color:var(--color-light)}.logs li::marker{color:#777}.time{color:#2d87d3;margin-right:6px}.input{width:99%;position:relative;bottom:0;align-self:center;background:inherit;border:inherit;padding-top:5px;padding-bottom:5px;margin-top:0;color:var(--color-light)}';
const styleElem = document.createElement("style");
styleElem.innerHTML = style;
document.head.appendChild(styleElem);

var consoleElement = `<div class="console" style="position: absolute; height: 27%; width: 18%; top:5px; right:5px; z-index: 10000; -webkit-box-shadow: 13px 5px 15px 5px rgba(0,0,0,0.50);box-shadow: 13px 5px 15px 5px rgba(0,0,0,0.50);"> <ol class="logs"></ol> <input class="input" placeholder="Type your command here..."/></div>`;
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
var isInTimeout = false;

const handler = new CommandHandler("/", (cmd, log) => {
  log.log("Unknown command: '" + cmd + "'");
});
handler.addCommand("token", (args) => {
  if (args[0]) {
    logs.warn("Verifying token '" + args[0] + "'");
    verify(args[0], () => {
      logs.warn("Token not valid!");
    }, () => {
      logs.success("Token valid. Now using token '" + args[0] + "'");
    });
  } else {
    eraseCookie("bottoken");
    getBotToken();
    logs.warn("Reset Token. Please enter a new one.");
  }
});

const logs = new Log(handler);
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
    case "intentional-error":
    case "error":
      logs.warn(message);
      processError(data);
      break;
    case "revive":
      if (isInTimeout) return;
      break;
    case "pixel":
      processPixel(data.pixel);
      break;
    default:
      logs.log(message);
      break;
  }
}

function processError(data) {
  switch (data.errorCode) {
    case 10:
      logs.log("Retrying in 1 min...");
      setTimeout(() => {
        drawNext();
      }, 60000);
      break;
    default:
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
    isInTimeOut = true;
    setTimeout(() => {
      isInTimeOut = false;
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
  if (!t || t == "") {
    setCookie("init", "checking", 1);
    if (!getCookie("init")) {
      logs.error("Please enable cookies in your browser in order to use this userscript!");
      return;
    }
    logs.log("No token found! Please enter your token!");
    modal.show();
    return;
  }
  logs.log("Token found! Using: " + t);
  init();
}

var verify;
function setupTokenCheck() {
  const btn = document.getElementById("checkToken");
  const input = btn.parentElement.children[0];
  btn.onclick = () => {
    const t = input.value;
    input.disabled = true;
    btn.innerText = "Checking token...";
    btn.disabled = true;

    verify = (key, e, s) => {
      fetch("https://tempauthserver.shadowlp174.repl.co/api/verify/" + key).then(res => {
        res.json().then(json => {
          if (json.type == "success") {
            modal.hide();
            setCookie("bottoken", t, 10);
            token = key;
            init();
            if (s) s();
            return;
          }
          btn.disabled = false;
          input.disabled = false;
          btn.innerText = "Token Invalid! Check Again";
          window.alert("Your token is invalid or there was an error.");
          if (e) e();
        }).catch((err) => {
          console.log(err);
        });
      });
    }
    verify(t);
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
function eraseCookie(name) {
  document.cookie = name + '=; Max-Age=-99999999;';
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

