const express = require('express');
const path = require("path");
const request = require('request');
const cors = require('cors');
const utilities = require('./utilities');
const fetch = require("node-fetch");
//const geolib = require("geolib");
const map = require('./map');

const datastruc = require('./data')
const cheerio = require('cheerio');
const svg2png=require('svg2png');
const fs=require('pn/fs');
const apiai = require('apiai');
var nlapp = apiai("f3673557663f4ae8b3f299c5b9c8f836");


var port = process.env.PORT || 8080;

const app = express();
app.use(cors());


//funzione che data sede e giorno restituisce le aule libere quel giorno
app.get('/sede/:sede', (req,res) => {
    let url;
    let sede;
    if (utilities.inArray(req.params.sede))
    {
        sede = req.params.sede;
        if (req.query.day&&req.query.month)     //se nella request ci sono i parametri day,month,year
        {
            let day = req.query.day;
            let month = req.query.month;
            let year = req.query.year;
            url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede="+ sede +"&_lang=it&date=" + day + "-" + month + "-" + year;
        }
        else        //se nella request non ci sono i parametri day,month,year significa "in questo momento"
        {
            let now = new Date();
            let day = now.getDate();
            let month = now.getMonth() + 1;
            let year = now.getFullYear();
            url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede="+ sede +"&_lang=it&date=" + day + "-" + month + "-" + year;
        }

        let now = new Date();
        let currentTimestamp = now.getTime() / 1000;


        let durataOre = 0;
        if(req.query.durataOre) {
            durataOre = req.query.durataOre;
        }
        
        fetch(url)
        .then(body => {
            return body.json();
        })
        .then(data => {
            return data.events;
        })
        .then(events => {
            let rooms = utilities.getRoomList(events);
            rooms =  utilities.cleanSchedule(rooms);
            rooms =  utilities.getFreeRooms(rooms, currentTimestamp);
            rooms =  utilities.cleanPastSchedule(rooms, currentTimestamp);
            rooms = utilities.getFreeRooms4xHours(rooms,durataOre,currentTimestamp);
            res.json(rooms); //Get the list of rooms with events that day and the hours in which they are busy.

            /*//console.log("SECONDO .then");
            let rooms = utilities.getRoomList(events);
            rooms = utilities.cleanSchedule(rooms);
            rooms = utilities.getFreeRooms(rooms, currentTimestamp);
            rooms = utilities.cleanPastSchedule(rooms, currentTimestamp);
            var map = map.getMaps(rooms, sede); // funzione base: attualmente fa diventare verdi le stanze presenti nel json a Povo A.
            //naturallanguage('cerco aula libera a Povo');
            map.conversionMap(map,res); // ritorna la mappa nel res sotto forma di file PNG. Da riadattare poi per stampare su bot.
            conversionMap(map,res); // ritorna la mappa nel res sotto forma di file PNG. Da riadattare poi per stampare su bot.

            //res.send(map);
            //res.json(rooms); //Get the list of rooms with events that day and the hours in which they are busy.
            */
        })
        .catch(error => {
            console.log(error);
        });
    }
});

function naturallanguage(frase) {
    var request = nlapp.textRequest(frase , {
        sessionId: 'dhbsajbi'
    });

    request.on('response', function(response) {
        console.log(response);
    });

    request.on('error', function(error) {
        console.log(error);
    });

    request.end();
}


app.get('/schedule/sede/:sede/aula/:aula', (req, res) => {
    let sede = req.params.sede;  //Id della sede
    let room = req.params.aula;  //nome aula

    let now = new Date();

    let risultato = [];

    let monday = utilities.getMonday(now);

    let currentDay = monday;

    for(let i = 0; i < 5; i++) { //Da lunedi a venerdi
        let day = currentDay.getDate();
        let month = currentDay.getMonth() + 1;
        let year = currentDay.getFullYear();

        risultato.push(utilities.getDaySchedule(sede, room, day, month, year));
        currentDay.setDate(currentDay.getDate() + 1);
    }

    Promise.all(risultato)
    .then(results => {
        res.json(results);
    })
});


app.get('/room', (req, res) => {
    let lat = req.query.lat;
    let lng = req.query.lng;

    let userCoord = {latitude:lat, longitude:lng};
    let nearestLocationInfo =  utilities.getNearestLocation(userCoord);
    let nearestLocation = nearestLocationInfo.key;
    let sede = datastruc.depIdToName[nearestLocation];
    let url;
    if (utilities.inArray(nearestLocation))
    {
        let now = new Date();
        let day = now.getDate();
        let month = now.getMonth() + 1;
        let year = now.getFullYear();

        url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede="+ nearestLocation +"&_lang=it&date=" + day + "-" + month + "-" + year;
        let currentTimestamp = now.getTime() / 1000;

        fetch(url)
        .then(body => {
            return body.json();
        })
        .then(data => {
            return data.events;
        })
        .then(events => {
            let rooms = utilities.getRoomList(events);
            rooms = utilities.cleanSchedule(rooms);
            rooms = utilities.getFreeRooms(rooms, currentTimestamp);
            rooms = utilities.cleanPastSchedule(rooms, currentTimestamp);
            rooms[0].sede = sede; //Solo il primo elemento avrà il campo sede che servirà per cambiare il titolo alla pagina
            res.json(rooms); //Get the list of rooms with events that day and the hours in which they are busy.
        })
        .catch(error => {
            console.log(error);
        });
    }

});

app.listen(port);
console.log("Server started on port " + port);
