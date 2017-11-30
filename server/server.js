const express = require('express');
const path = require("path");
const request = require('request');
const cors = require('cors');
const utilities = require('./utilities');
const fetch = require("node-fetch");
//const geolib = require("geolib");
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
            
            /*//console.log("SECONDO .then");
            let rooms = utilities.getRoomList(events); 
            rooms = utilities.cleanSchedule(rooms);    
            rooms = utilities.getFreeRooms(rooms, currentTimestamp);
            rooms = utilities.cleanPastSchedule(rooms, currentTimestamp);
            var map = getMaps(rooms, sede); // funzione base: attualmente fa diventare verdi le stanze presenti nel json a Povo A.
            //naturallanguage('cerco aula libera a Povo');
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

function getMaps(rooms,sede){
    var output;
    var sourceBuffer;
    
    switch(sede){
        case 'E0503':

        //Povo A piano P1
        var $ = cheerio.load(fs.readFileSync(path.join(__dirname+'/../img/Povo1P1.svg')));
            for(i = 0; i<rooms.length;i++){
                if(rooms[i].room <= 437 && rooms[i].room >= 414){
                    var id = 201 + (437 - rooms[i].room) ;
                    var stringa = "#a" + id;
                    var rect = $(stringa);
                    rect.attr('fill','green');
                    }
            }   
       // output = new Buffer( $.html() );       

        //Povo A piano PT
        $ = cheerio.load(fs.readFileSync(path.join(__dirname+'/../img/Povo1PT.svg')));
            for(i = 0; i<rooms.length;i++){
                if(rooms[i].room <= 445 && rooms[i].room >= 438){
                    var id = 101 + (445 - rooms[i].room) ;
                    var stringa = "#a" + id;
                    var rect = $(stringa);
                    rect.attr('fill','green');
                    }
            }
       // output =  $.html();
    }

      //Povo B piano P1
        $ = cheerio.load(fs.readFileSync(path.join(__dirname+'/../img/Povo2P1.svg')));
            for(i = 0; i<rooms.length;i++){
                if(rooms[i].room <= 403 && rooms[i].room >= 402){
                    var id = 106 + (403 - rooms[i].room) ;
                    var stringa = "#b" + id;
                    var rect = $(stringa);
                    rect.attr('fill','green');
                    }
            }
        // output = $.html();

         //Povo B piano PT
         $ = cheerio.load(fs.readFileSync(path.join(__dirname+'/../img/Povo2PT.svg')));
            for(i = 0; i<rooms.length;i++){
                if(rooms[i].room <= 408 && rooms[i].room >= 404){
                    var id = 101 + (408 - rooms[i].room) ;
                    var stringa = "#b" + id;
                    var rect = $(stringa);
                    rect.attr('fill','green');
                    }
            }
          output=  $.html();
        //console.log(output);
         
    return output;

}

module.exports.getMaps = getMaps;

function conversionMap(map,res){
    var sourceBuffer;
    svg2png(map)
    .then(function (buffer) {
        sourceBuffer = new Buffer(buffer, 'base64'); 
         res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': sourceBuffer.length
          });
        res.end(sourceBuffer);       
    })
    .catch(function (error) {
        console.log("Conversion Error!");
    });
   
}


app.get('/schedule/:sede/:aula', (req, res) => {
    let now = new Date();
    let day = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    let sede = req.params.sede;  //Id della sede
    let room= req.params.aula;  //nome aula
    let roomCode = sede + '/' + room;
    console.log("trying get data");
    let url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede=" + sede + "&_lang=it&date=" + day + "-" + month + "-" + year;
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
        console.log("damn it");
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
