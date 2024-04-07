if ("serviceWorker" in navigator){
navigator.serviceWorker.register("/service.js");}
navigator.serviceWorker.ready.then(function(registration){
registration.sync.register("sync").then(function(){},
function(){});});

const share = document.getElementById("share");
share.addEventListener("click", event => {
if (navigator.share) { navigator.share({
title: "Bayu Angora", url: "" }).then(() => {
console.log("Thanks");}) .catch(console.error);}});

if (localStorage.getItem("preferredTheme")==="dark")
{setMode(true);}
function setMode(isDark) {
var dark=document.getElementById("dark");
var light=document.getElementById("light");
if (isDark){light.style.display="block";
dark.style.display="none";
localStorage.setItem("preferredTheme","dark");
} else {
light.style.display="none";
dark.style.display="block";
localStorage.removeItem("preferredTheme");}
document.body.classList.toggle("mode");}
document.getElementById("dark").addEventListener("click", 
function() {setMode(true);});
document.getElementById("light").addEventListener("click", 
function() {setMode(false);});

function flyingPages() {
const toPrefetch = new Set();
const alreadyPrefetched = new Set();
const prefetcher = document.createElement("link");
const isSupported =
prefetcher.relList &&
prefetcher.relList.supports &&
prefetcher.relList.supports("prefetch") &&
window.IntersectionObserver &&
"isIntersecting" in IntersectionObserverEntry.prototype;
const isSlowConnection =
navigator.connection &&
(navigator.connection.saveData ||
(navigator.connection.effectiveType || "").includes("2g"));
if (isSlowConnection || !isSupported) return;
const prefetch = (url) =>
new Promise((resolve, reject) => {
const link = document.createElement(`link`);
link.rel = `prefetch`;
link.href = url;
link.onload = resolve;
link.onerror = reject;
document.head.appendChild(link);
});
const prefetchWithTimeout = (url) => {
const timer = setTimeout(() => stopPrefetching(), 1000);
prefetch(url)
.catch(() => stopPrefetching())
.finally(() => clearTimeout(timer));
};
const addUrlToQueue = (url, processImmediately = false) => {
if (alreadyPrefetched.has(url) || toPrefetch.has(url)) return;
const origin = window.location.origin;
if (url.substring(0, origin.length) !== origin) return;
if (window.location.href === url) return;
for (let i = 0; i < window.FPConfig.ignoreKeywords.length; i++) {
if (url.includes(window.FPConfig.ignoreKeywords[i])) return;
}
if (processImmediately) {
prefetchWithTimeout(url);
alreadyPrefetched.add(url);
} else toPrefetch.add(url);
};
const linksObserver = new IntersectionObserver((entries) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
const url = entry.target.href;
addUrlToQueue(url, !window.FPConfig.maxRPS);
}
});
});
const startQueue = () =>
setInterval(() => {
Array.from(toPrefetch)
.slice(0, window.FPConfig.maxRPS)
.forEach((url) => {
prefetchWithTimeout(url);
alreadyPrefetched.add(url);
toPrefetch.delete(url);
});
}, 1000);
let hoverTimer = null;
const mouseOverListener = (event) => {
const elm = event.target.closest("a");
if (elm && elm.href && !alreadyPrefetched.has(elm.href)) {
hoverTimer = setTimeout(() => {
addUrlToQueue(elm.href, true);
}, window.FPConfig.hoverDelay);
}};
const touchStartListener = (event) => {
const elm = event.target.closest("a");
if (elm && elm.href && !alreadyPrefetched.has(elm.href))
addUrlToQueue(elm.href, true);
};
const mouseOutListener = (event) => {
const elm = event.target.closest("a");
if (elm && elm.href && !alreadyPrefetched.has(elm.href)) {
clearTimeout(hoverTimer);
}};
const requestIdleCallback =
window.requestIdleCallback ||
function (cb) {
const start = Date.now();
return setTimeout(function () {
cb({
didTimeout: false,
timeRemaining: function () {
return Math.max(0, 50 - (Date.now() - start));
},
});
}, 1);
};
const stopPrefetching = () => {
document.querySelectorAll("a").forEach((e) => linksObserver.unobserve(e));
toPrefetch.clear();
document.removeEventListener("mouseover", mouseOverListener, true);
document.removeEventListener("mouseout", mouseOutListener, true);
document.removeEventListener("touchstart", touchStartListener, true);
};
const defaultOptions = {
delay: 0,
ignoreKeywords: [],
maxRPS: 20,
hoverDelay: 20,
};
window.FPConfig = Object.assign(defaultOptions, window.FPConfig);
startQueue();
requestIdleCallback(() =>
setTimeout(
() =>
document.querySelectorAll("a").forEach((e) => linksObserver.observe(e)),
window.FPConfig.delay * 1000
));
const listenerOptions = {
capture: true,
passive: true,
};
document.addEventListener("mouseover", mouseOverListener, listenerOptions);
document.addEventListener("mouseout", mouseOutListener, listenerOptions);
document.addEventListener("touchstart", touchStartListener, listenerOptions);
}
flyingPages();
