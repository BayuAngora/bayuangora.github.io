const CACHE_VERSION = 1;
const OFFLINE_URL = "/404";
let CURRENT_CACHES = {
notFound: "404-v" + CACHE_VERSION,
offline: "offline-v" + CACHE_VERSION,
content: "content-v" + CACHE_VERSION,
};
function createCacheBustedRequest(url) {
let request = new Request(url, { cache: "reload" });
if ("cache" in request) {
return request;}
let bustedUrl = new URL(url, self.location.href);
bustedUrl.search += (bustedUrl.search ? "&" : "") + "cachebust=" + Date.now();
return new Request(bustedUrl);}
self.addEventListener("install", (event) => {
event.waitUntil(
fetch(createCacheBustedRequest(OFFLINE_URL)).then(function (response) {
return caches.open(CURRENT_CACHES.offline).then(function (cache) {
return cache.put(OFFLINE_URL, response);
});}));});
self.addEventListener("activate", (event) => {
let expectedCacheNames = Object.keys(CURRENT_CACHES).map(function (key) {
return CURRENT_CACHES[key];
});
event.waitUntil(
caches.keys().then((cacheNames) => {
return Promise.all(
cacheNames.map((cacheName) => {
if (expectedCacheNames.indexOf(cacheName) === -1) {
console.log("Deleting out of date cache:", cacheName);
return caches.delete(cacheName);
}}));}));});
self.addEventListener("fetch", (event) => {
if (event.request.mode === "navigate" || (event.request.method === "GET" &&
event.request.headers.get("accept").includes("text/html"))) {
console.log("Handling fetch event for", event.request.url);
event.respondWith(
fetch(event.request).catch((error) => {
console.log("Fetch failed; returning offline page instead.", error);
return caches.match(OFFLINE_URL);
}));}});
self.addEventListener("sync", (event) => {
if (event.tag === "sync") {event.waitUntil(syncContent());
} else if (event.tag === "database-sync") {
event.waitUntil(pushLocalDataToDatabase());
}});
async function requestSync() {
try {
if ("sync" in self.registration) {
await self.registration.sync.register("sync");}} 
catch (error) {
console.warn("Background sync is disabled", error);}}
self.addEventListener("periodicsync", (event) => {
if (event.tag === "fetch-new-content") {
event.waitUntil(fetchNewContent());
}});
self.addEventListener("push", (event) => {
event.waitUntil(
self.registration.showNotification("Bayu Angora", {
body: "Bayu Angora",
icon: "favicon.png",
}));});
self.addEventListener("notificationclick", (event) => {
event.notification.close();
var fullPath = self.location.origin + event.notification.data.path;
clients.openWindow(fullPath);});
async function syncContent() {
console.log("Syncing content...");}
async function pushLocalDataToDatabase() {
console.log("Pushing local data to DB...");}
async function fetchNewContent() {
console.log("Fetching new content for periodic sync...");}
