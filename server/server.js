const express = require('express');
const request = require('request');
const cors = require('cors');
const utilities = require('./utilities');
const fetch = require("node-fetch");
const datastruc = require('./data');
const apiai = require('apiai');
var nlapp = apiai("f3673557663f4ae8b3f299c5b9c8f836");


var port = process.env.PORT || 8080;

const app = express();
app.use(cors());

app.get('/void',(req,res) => {
    res.json("Errore!");
});

//funzione che data una stringa estrae i dati (place,ecc.) e redirige la richiesta
app.get('/nl', (req,res) => {
    let frase = req.query.frase; //frase ricevuta

    if(frase == undefined) res.redirect('http://localhost:8080/'); 

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
            "time" : response.result.parameters.time,
            "durata" : response.result.parameters.durata.time};

            let urldate = '';
            let urltime = '';
            let urldurata = '';

            if(nlresp.date != '') urldate = 'date=' + nlresp.date;
            if(nlresp.time != '') urltime = 'time=' + nlresp.time;
            if(nlresp.durata != '') urldurata = 'durataOre=' + nlresp.durata;

            
            if(nlresp.Place != null) {
                place = nlresp.Place.toLowerCase();
                let code_place = datastruc.dep_id[place];

                res.redirect('http://uniroomtn.herokuapp.com/sede/' + code_place + '?' + urldate + '&' + urltime + '&' + urldurata);
            } else res.redirect('http://uniroomtn.herokuapp.com/void');

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

            //console.log(aularesp);

            if(aularesp.povoA1P != '') res.redirect('http://localhost:8080/schedule/sede/' + department.dep_id['povo'] + '/aula/' + aularesp.povoA1P);
            else if(aularesp.povoAPT != '')res.redirect('http://localhost:8080/schedule/sede/' + department.dep_id['povo'] + '/aula/' + aularesp.povoAPT);
            else if(aularesp.povoB1P != '')res.redirect('http://localhost:8080/schedule/sede/' + department.dep_id['povo'] + '/aula/' + aularesp.povoB1P);
            else if(aularesp.povoBPT != '')res.redirect('http://localhost:8080/schedule/sede/' + department.dep_id['povo'] + '/aula/' + aularesp.povoBPT);
            else if(aularesp.povoaltro != '')res.redirect('http://localhost:8080/schedule/sede/' + department.dep_id['povo'] + '/aula/' + aularesp.povoaltro);
            else if(aularesp.cognitive != '')res.redirect('http://localhost:8080/schedule/sede/' + department.dep_id['scienze cognitive'] + '/aula/' + aularesp.cognitive);
            else if(aularesp.economia != '')res.redirect('http://localhost:8080/schedule/sede/' + department.dep_id['economia'] + '/aula/' + aularesp.economia);
            else if(aularesp.giurisprudenza != '')res.redirect('http://localhost:8080/schedule/sede/' + department.dep_id['giurisprudenza'] + '/aula/' + aularesp.giurisprudenza);
            else if(aularesp.lettere != '')res.redirect('http://localhost:8080/schedule/sede/' + department.dep_id['lettere'] + '/aula/' + aularesp.lettere);
            else if(aularesp.mesiano != '')res.redirect('http://localhost:8080/schedule/sede/' + department.dep_id['mesiano'] + '/aula/' + aularesp.mesiano);
            else if(aularesp.sociologia != '')res.redirect('http://localhost:8080/schedule/sede/' + department.dep_id['sociologia'] + '/aula/' + aularesp.sociologia);
            else res.redirect('http://localhost:8080/schedule/sede/' + 'E0503' + '/aula/' + aula);
        }
        else res.redirect('http://uniroomtn.herokuapp.com/void');

        


    }).on('error', function(error) {
        console.log(error);
    }).end();

});

//funzione che data sede e giorno restituisce le aule libere quel giorno
app.get('/sede/:sede', (req,res) => {
    let url;
    let sede;
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

            let time = req.query.time;
            let timeString = time.split(':');
            date.setHours(parseInt(timeString[0]));
            date.setMinutes(parseInt(timeString[1]));
             timeStamp = (now.getTime() / 1000) -3200;
            url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede="+ sede +"&_lang=it&date=" + day + "-" + month + "-" + year;
            //console.log("Caso 1");
        }
        else if(req.query.time != undefined && req.query.time != "null"){ //nella request abbiamo solo il tempo, prendiamo come data "in questo momento"
            let now = new Date();
            let day = now.getDate();
            let month = now.getMonth() + 1;
            let year = now.getFullYear();
            let time = req.query.time;
            let timeString = time.split(':');
            now.setHours(parseInt(timeString[0]));
            now.setMinutes(parseInt(timeString[1]));
             timeStamp = (now.getTime() / 1000) -3200;
            url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede="+ sede +"&_lang=it&date=" + day + "-" + month + "-" + year;
             //console.log("Caso 2");
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
            rooms =  utilities.cleanSchedule(rooms);
            rooms =  utilities.getFreeRooms(rooms, timeStamp);
            rooms =  utilities.cleanPastSchedule(rooms, timeStamp);
            if(durataOre > 0) {
                rooms = utilities.getFreeRooms4xHours(rooms,durataOre,timeStamp);
            }         
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
