if ("serviceWorker" in navigator) {
navigator.serviceWorker.register("/service.js");
navigator.serviceWorker.ready.then(async function (registration) {
if ("sync" in registration) {
registration.sync.register("sync").catch(console.error);
} try {
if ("periodicSync" in registration) {
const periodicSyncPermission = await navigator.permissions.query({
name: "periodic-background-sync",
});
if (periodicSyncPermission.state === "granted") {
await registration.periodicSync.register("fetch-new-content", {
minInterval: 24 * 60 * 60 * 1000,
});}}
} catch (error) {
console.error("Periodic Sync Error:", error);
}});}

document.addEventListener("DOMContentLoaded", function () {
const shareBtn = document.getElementById("share");
if (shareBtn) { 
shareBtn.addEventListener("click", function () {
if (navigator.share) {
navigator.share({
title: "Bayu Angora",
url: window.location.href,
})
.then(() => console.log("Thanks"))
.catch(console.error);
}});}
const darkBtn = document.getElementById("dark");
const lightBtn = document.getElementById("light");
function setMode(isDark) {
if (isDark) {
if (lightBtn) lightBtn.style.display = "block";
if (darkBtn) darkBtn.style.display = "none";
localStorage.setItem("preferredTheme", "dark");
} else {
if (lightBtn) lightBtn.style.display = "none";
if (darkBtn) darkBtn.style.display = "block";
localStorage.removeItem("preferredTheme");}
document.body.classList.toggle("mode", isDark);}
if (localStorage.getItem("preferredTheme") === "dark") {
setMode(true);}
if (darkBtn) {
darkBtn.addEventListener("click", function () {
setMode(true);
});}
if (lightBtn) {
lightBtn.addEventListener("click", function () {
setMode(false);
});}});
