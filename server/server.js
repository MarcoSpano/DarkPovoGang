const express = require('express');
const path = require("path");
const request = require('request');
const cors = require('cors');
const utilities = require('./utilities');
const fetch = require("node-fetch");
const department = require("./data.js");
//const geolib = require("geolib");
const map = require('./map');

const datastruc = require('./data')
const cheerio = require('cheerio');
const svg2png=require('svg2png');
const fs=require('pn/fs');
const apiai = require('apiai');
var nlapp = apiai("f3673557663f4ae8b3f299c5b9c8f836");

var povo = ['/img/Povo1PT.svg','/img/Povo1P1.svg','/img/Povo2PT.svg','/img/Povo2P1.svg']

var port = process.env.PORT || 8080;

const app = express();
app.use(cors());

app.get('/void',(req,res) => {
    res.json("Errore!");
});

//funzione che data una stringa estrae i dati (place,ecc.) e redirige la richiesta
app.get('/nl', (req,res) => {
    let frase = req.query.frase; //frase ricevuta

    if(frase == undefined) res.redirect('https://uniroomtn.herokuapp.com/');

    //throw error

    var request = nlapp.textRequest(frase , {
        sessionId: '0' //non ci serve, non abbiamo bisogno di creare dialoghi
    });

    request.on('response', function(response) {
        //console.log(response);
        //dati estratti dalla stringa




        if(response.result.action === "return.aulalibera") {

            var nlresp = {"Place" : response.result.parameters.Place,
            "date" : response.result.parameters.date,
            "time" : response.result.parameters.time};

            let urldate = 'date=null';
            let urltime = 'time=null';
            let urldurata = 'durata=null';
            let urldurataunit = 'durataunit=null';

            if(nlresp.date != '') urldate = 'date=' + nlresp.date;
            if(nlresp.time != '') urltime = 'time=' + nlresp.time;
            if(response.result.parameters.durata != '') {
                if(response.result.parameters.durata.duration.amount != '') urldurata = 'durataOre=' + response.result.parameters.durata.duration.amount;
                if(response.result.parameters.durata.duration.unit != '') urldurataunit = 'durataunit=' + response.result.parameters.durata.duration.unit;
            }


            if(nlresp.date == 'date='){
                nlresp.date = 'date=null';
            }
            if(nlresp.time == 'time='){
                nlresp.time = 'time=null';
            }


            if(nlresp.Place != null) {
                place = nlresp.Place.toLowerCase();
                let code_place = datastruc.dep_id[place];

                res.redirect('https://uniroomtn.herokuapp.com/sede/' + code_place + '?' + urldate + '&' + urltime + '&' + urldurata + '&' + urldurataunit);
            } else res.redirect('https://uniroomtn.herokuapp.com/void');

        } else if(response.result.action === "return.scheduleaula") {
            var aularesp = {"povoA1P" : response.result.parameters.aulepovoA1p,
            "povoAPT" : response.result.parameters.aulepovoAPT,
            "povoB1P" : response.result.parameters.aulepovoB1p,
            "povoBPT" : response.result.parameters.aulepovoBPT,
            "povoaltro" : response.result.parameters.aulepovoaltro,
            "cognitive" : response.result.parameters.aulecognitive,
            "economia" : response.result.parameters.auleeconomia,
            "giurisprudenza" : response.result.parameters.aulegiurisprudenza,
            "lettere" : response.result.parameters.aulelettere,
            "mesiano" : response.result.parameters.aulemesiano,
            "sociologia" : response.result.parameters.aulesociologia };

            //console.log(aularesp); https://stebranchi.github.io/DarkPovoGang/aula.html?aula=A105&sede=E0503

            if(aularesp.povoA1P != '') res.json('https://stebranchi.github.io/DarkPovoGang/aula.html?sede=' + datastruc.dep_id['povo'] + '&aula=' + aularesp.povoA1P);
            else if(aularesp.povoAPT != '')res.json('https://stebranchi.github.io/DarkPovoGang/aula.html?sede=' + datastruc.dep_id['povo'] + '&aula=' + aularesp.povoAPT);
            else if(aularesp.povoB1P != '')res.json('https://stebranchi.github.io/DarkPovoGang/aula.html?sede=' + datastruc.dep_id['povo'] + '&aula=' + aularesp.povoB1P);
            else if(aularesp.povoBPT != '')res.json('https://stebranchi.github.io/DarkPovoGang/aula.html?sede=' + datastruc.dep_id['povo'] + '&aula=' + aularesp.povoBPT);
            else if(aularesp.povoaltro != '')res.json('https://stebranchi.github.io/DarkPovoGang/aula.html?sede=' + datastruc.dep_id['povo'] + '&aula=' + aularesp.povoaltro);
            else if(aularesp.cognitive != '')res.json('https://stebranchi.github.io/DarkPovoGang/aula.html?sede=' + datastruc.dep_id['scienze cognitive'] + '&aula=' + aularesp.cognitive);
            else if(aularesp.economia != '')res.json('https://stebranchi.github.io/DarkPovoGang/aula.html?sede=' + datastruc.dep_id['economia'] + '&aula=' + aularesp.economia);
            else if(aularesp.giurisprudenza != '')res.json('https://stebranchi.github.io/DarkPovoGang/aula.html?sede=' + datastruc.dep_id['giurisprudenza'] + '&aula=' + aularesp.giurisprudenza);
            else if(aularesp.lettere != '')res.json('https://stebranchi.github.io/DarkPovoGang/aula.html?sede=' + datastruc.dep_id['lettere'] + '&aula=' + aularesp.lettere);
            else if(aularesp.mesiano != '')res.json('https://stebranchi.github.io/DarkPovoGang/aula.html?sede=' + datastruc.dep_id['mesiano'] + '&aula=' + aularesp.mesiano);
            else if(aularesp.sociologia != '')res.json('https://stebranchi.github.io/DarkPovoGang/aula.html?sede=' + datastruc.dep_id['sociologia'] + '&aula=' + aularesp.sociologia);
            else res.json('https://uniroomtn.herokuapp.com/void');
        }
        else res.redirect('https://uniroomtn.herokuapp.com/void');




    }).on('error', function(error) {
        console.log(error);
    }).end();

});

//funzione che data sede e giorno restituisce le aule libere quel giorno
app.get('/sede/:sede', (req,res) => {
    let url;
    let sede;
    let time;
    if (utilities.inArray(req.params.sede))
    {
        let timeStamp;
        sede = req.params.sede;
        if ( (typeof req.query.date !== undefined) && req.query.date != "null" && req.query.time != undefined && req.query.time != "null")       //se nella request ci sono i parametri day,month,year
        {
            let datePar = req.query.date;
            let date = new Date(datePar);
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();

            time = req.query.time;
            let timeString = time.split(':');
            date.setHours(parseInt(timeString[0]));
            date.setMinutes(parseInt(timeString[1]));
            timeStamp = (date.getTime() / 1000) - 3200;
            url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede="+ sede +"&_lang=it&date=" + day + "-" + month + "-" + year;
            //console.log("Caso 1");
        }
        else if(req.query.time != undefined && req.query.time != "null" && req.query.date =="null"){ //nella request abbiamo solo il tempo, prendiamo come data "in questo momento"
            let now = new Date();
            let day = now.getDate();
            let month = now.getMonth() + 1;
            let year = now.getFullYear();

            time = req.query.time;
            let timeString = time.split(':');
            now.setHours(parseInt(timeString[0]));
            now.setMinutes(parseInt(timeString[1]));
            timeStamp = (now.getTime() / 1000) -3200;
            console.log(timeStamp);
            url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede="+ sede +"&_lang=it&date=" + day + "-" + month + "-" + year;
             //console.log("Caso 2");
        }
        else if(req.query.date != undefined && req.query.date != "null" && req.query.time =="null"){ //Abbiamo solo il giorno, partirà dall'ora attuale
            let datePar = req.query.date;
            let date = new Date(datePar);
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();

            let date2 = new Date();
            let hours = date2.getHours();
            let minutes = date2.getMinutes();
            date.setHours(hours);
            date.setMinutes(minutes);
            timeStamp = (date.getTime() / 1000);
            url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede="+ sede +"&_lang=it&date=" + day + "-" + month + "-" + year;
        }
        else      //se nella request non ci sono i parametri day,month,year significa "in questo momento"
        {
            let now = new Date();
            let day = now.getDate();
            let month = now.getMonth() + 1;
            let year = now.getFullYear();
            timeStamp = now.getTime() / 1000;
            url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede="+ sede +"&_lang=it&date=" + day + "-" + month + "-" + year;
             //console.log("Caso 3");
        }

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
            //console.log("1: "+rooms);
            rooms =  utilities.cleanSchedule(rooms);
            //console.log("2: "+rooms);
            rooms =  utilities.getFreeRooms(rooms, timeStamp);
            //console.log("3: "+rooms);
            rooms =  utilities.cleanPastSchedule(rooms, timeStamp);
            //console.log("4: "+rooms);
            if(durataOre > 0) {
                rooms = utilities.getFreeRooms4xHours(rooms,durataOre,timeStamp);
            }
            rooms[0].time = time;
            //rooms[0].time = req.query.time;
            //rooms[0].time = req.query.time; //Solo il primo elemento avrà il campo sede che servirà per cambiare il titolo alla pagina
            res.json(rooms); //Get the list of rooms with events that day and the hours in which they are busy.
        })
        .catch(error => {
            console.log(error);
        });
    }
});


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
    let nearestLocation =  utilities.getNearestLocation(userCoord);
    let sede = datastruc.depIdToName[nearestLocation];
    let url;

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
});

app.listen(port);
console.log("Server started on port " + port);
