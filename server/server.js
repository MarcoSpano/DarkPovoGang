const express = require('express');
const path = require("path");
const request = require('request');
const cors = require('cors');
const utilities = require('./utilities');
const fetch = require("node-fetch");

var port = process.env.PORT || 8080;
                    
const app = express();
app.use(cors());


app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/../client/index.html'));
});

//funzione che data sede e giorno restituisce le aule libere quel giorno
app.get('/sede/:sede', (req,res) => {
    let url;
    let sede;
    if (utilities.inArray(req.params.sede))
    {
        sede = req.params.sede;
        if (req.query.day&&req.query.month)     //se nella request ci sono i parametri day,month,year
        {
            //console.log("data e ora dalla request");
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
            res.json(rooms); //Get the list of rooms with events that day and the hours in which they are busy.
        })
        .catch(error => {
            console.log(error);
        });
    }
});


app.get('/schedule/:sede/:aula', (req, res) => {
    let now = new Date();
    let day = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    let sede = req.params.sede;  //Id della sede
    let room= req.params.aula;  //nome aula
    let roomCode = sede + '/' + room;

    let url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede=" + sede + "&_lang=it&date=20-11-2017";
    utilities.idRoomCode(url)
    .then(response => {
        return response[roomCode];
    })
    .then(id => { //id della stanza
        fetch(url) 
        .then(body => { 
            return body.json();
        })
        .then(data => {
            let events = data.events; //cerchiamo tutti gli eventi in quella sede per quel determinato giorno
            
            let room =  utilities.getRoomSchedule(events, id); //otteniamo lo schedule della stanza prescelta e lo inviamo come json
            
            res.json(room);
        })
        .catch(error => {
            console.log(error);
        })             
    })
    .catch(error => {
        console.log(error);
    })
}); 


app.get('/room', (req, res) => {
    let lat = req.query.lat;
    let lng = req.query.lng;

    let userCoord = {latitude:lat, longitude:lng};
    let nearestLocationInfo =  utilities.getNearestLocation(userCoord);
    let nearestLocation = nearestLocationInfo.key;

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
            res.json(rooms); //Get the list of rooms with events that day and the hours in which they are busy.
        })
        .catch(error => {
            console.log(error);
        });
    }
    
});

app.listen(port);
console.log("Server started on port " + port);
