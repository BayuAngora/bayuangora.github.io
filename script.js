if ("serviceWorker" in navigator){
navigator.serviceWorker.register("/script.js");}
navigator.serviceWorker.ready.then(function(registration){
registration.sync.register("sync").then(function(){},
function(){});});

const share = document.getElementById("share");
share.addEventListener("click", event => {
if (navigator.share) { navigator.share({
title: "Bayu Angora", url: "" }).then(() => {
console.log("Thanks");}) .catch(console.error);}});

function setMode(e){
var t=document.getElementById("dark"),d=document.getElementById("light");e?(d.style.display="block",t.style.display="none",
localStorage.setItem("preferredTheme","dark")):(d.style.display="none",t.style.display="block",
localStorage.removeItem("preferredTheme")),document.body.classList.toggle("mode")}"dark"===
localStorage.getItem("preferredTheme")&&setMode(!0),document.getElementById("dark").addEventListener("click",(
function(){setMode(!0)})),document.getElementById("light").addEventListener("click",(function(){setMode(!1)}));

const CACHE_VERSION = 1;
const OFFLINE_URL = "/404";
let CURRENT_CACHES = {
notFound: "404-v" + CACHE_VERSION,
offline: "offline-v" + CACHE_VERSION,
content: "content-v" + CACHE_VERSION,};
function createCacheBustedRequest(url){
let request = new Request(url, {cache: "reload"});if ("cache" in request){return request;}
let bustedUrl = new URL(url, self.location.href);bustedUrl.search += (bustedUrl.search ? "&" : "") + "cachebust=" + Date.now();return new Request(bustedUrl);}
self.addEventListener("install", event => {event.waitUntil(fetch(createCacheBustedRequest(OFFLINE_URL)).then(function(response){return caches.open(CURRENT_CACHES.offline).then(function(cache){return cache.put(OFFLINE_URL, response);});}));});
self.addEventListener("activate", event => {let expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key){return CURRENT_CACHES[key];});event.waitUntil(caches.keys().then(cacheNames => {return Promise.all(cacheNames.map(cacheName => {if (expectedCacheNames.indexOf(cacheName) === -1){console.log("Deleting out of date cache:", cacheName);return caches.delete(cacheName);}}));}));});
self.addEventListener("fetch", event => {if (event.request.mode === "navigate" || (event.request.method === "GET" &&event.request.headers.get("accept").includes("text/html"))){console.log("Handling fetch event for", event.request.url);event.respondWith(fetch(event.request).catch(error => {console.log("Fetch failed; returning offline page instead.", error);return caches.match(OFFLINE_URL);}));}});
self.addEventListener("sync", event => {if (event.tag === "sync"){event.waitUntil(syncContent());}});async function requestSync(){await self.registration.sync.register("sync");}
