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

const periodicSyncPermission = await navigator.permissions.query({
name: "periodic-background-sync",});
if (periodicSyncPermission.state == "granted"){
await registration.periodicSync.register("fetch-new-content",{
minInterval: 24 * 60 * 60 * 1000});} 

function setMode(e){
var t=document.getElementById("dark"),d=document.getElementById("light");e?(d.style.display="block",t.style.display="none",
localStorage.setItem("preferredTheme","dark")):(d.style.display="none",t.style.display="block",
localStorage.removeItem("preferredTheme")),document.body.classList.toggle("mode")}"dark"===
localStorage.getItem("preferredTheme")&&setMode(!0),document.getElementById("dark").addEventListener("click",(
function(){setMode(!0)})),document.getElementById("light").addEventListener("click",(function(){setMode(!1)}));
