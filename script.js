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
