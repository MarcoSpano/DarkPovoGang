const express = require('express');
const path = require("path");
const request = require('request');
const cors = require('cors');
const fetch = require("node-fetch");
const geolib = require("geolib");

var port = process.env.PORT || 8080;
var department_id =[("economia","E0101"),
                    ("lettere","E0801"),
                    ("filosofia","E0801"),
                    ("mesiano","E0301"),
                    ("ingegneria","E0301"),
                    ("giurisprudenza","E0201"),
                    ("sociologia","E0601"),
                    ("scienze cognitive","E0705"),
                    ("povo","E0503")];

var dep_coordinates = {
    "E0601" : {latitude:46.06666060000001, longitude:11.1196512},
    "E0705" : {latitude:45.89370539999999, longitude:11.0435276},
    "E0101" : {latitude:46.0662709, longitude:11.1176511},
    "E0201" : {latitude:46.0669596, longitude:11.1195936},
    "E0801" : {latitude:46.0677156, longitude:11.1166435},
    "E0301" : {latitude:46.06551,longitude:11.1407375},
    "E0503" : {latitude:46.067012, longitude:11.1499029}
};                    
                  

function inArray(sede){
    if(!sede) {
        throw new Error('No parameter inserted');
    }
    if(typeof sede != "string") {
        throw new TypeError('No string parameter inserted');
    }
    for (let i = 0; i < department_id.length; i++)
    {
        if(sede === department_id[i])
            return true;
    }
    return false;
}

const app = express();
app.use(cors());

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/../client/index.html'));
});

//funzione che data sede e giorno restituisce le aule libere quel giorno
app.get('/sede/:sede', (req,res) => {
    let url;
    let sede;
    //console.log("INIZIO");
    if (inArray(req.params.sede))
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
            //console.log("data e ora = now");
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
            //console.log("SECONDO .then");
            let rooms = getRoomList(events); 
            rooms = cleanSchedule(rooms);    
            rooms = getFreeRooms(rooms, currentTimestamp);
            rooms = cleanPastSchedule(rooms, currentTimestamp);
            res.json(rooms); //Get the list of rooms with events that day and the hours in which they are busy.
        })
        .catch(error => {
            console.log(error);
        });
    }
});


function getRoomList(events) {
    if(!events) {
        throw new Error('No parameter inserted');
    }
    if(typeof events != "object") {
        throw new TypeError('No object parameter inserted');
    }
    let rooms = [];
    for(let i = 0; i < events.length; i++) {
        let room = {room: events[i].room,
                    NomeAula: events[i].NomeAula,
                    orario: [{
                        from: events[i].from,
                        to: events[i].to,
                        timestamp_day: events[i].timestamp_day,
                        timestamp_from: events[i].timestamp_from,
                        timestamp_to: events[i].timestamp_to
                    }]
                    };
        let id = -1;
        for(let j = 0; j < rooms.length; j++) {
            if(rooms[j].room === room.room) {
                id = j;
            }
        }  
        
        if(id >= 0) {
            let newOrario = {
                from: events[i].from,
                to: events[i].to,
                timestamp_day: events[i].timestamp_day,
                timestamp_from: events[i].timestamp_from,
                timestamp_to: events[i].timestamp_to
            };
            rooms[id].orario.push(newOrario);
            id = -1;
        } else {
            rooms.push(room); 
        } 
                                       
    }
    return rooms;
}

function cleanSchedule(rooms) {
    for(let i = 0; i < rooms.length; i++) {
        for(let j = 0; j < rooms[i].orario.length - 1; j++) {
            if(rooms[i].orario[j].timestamp_to === rooms[i].orario[j + 1].timestamp_from) {
                rooms[i].orario[j].to = rooms[i].orario[j + 1].to;
                rooms[i].orario[j].timestamp_to = rooms[i].orario[j + 1].timestamp_to;
                rooms[i].orario.splice(j + 1, 1);
                j--;
            }
        }
    }
    return rooms;
}

function getFreeRooms(rooms, timeStamp) {
    let closeTimeStamp;
    if(rooms.length > 0) {
        closeTimeStamp = rooms[0].orario[0].timestamp_day + 72000; // Time 20:00
    } 
    for(let i = 0; i < rooms.length; i++) {
		if(rooms[i].NomeAula.indexOf("Aula") == -1 && rooms[i].NomeAula.indexOf("AULA") == -1 && rooms[i].NomeAula.indexOf("aula") == -1) {
			rooms.splice(i,1);
			i--;			
		} 
			
        //Check if the current time is between 00:00 and 20:00
        else if(rooms[i].orario.length > 0 && (timeStamp > rooms[i].orario[0].timestamp_day && timeStamp < closeTimeStamp)) {      
            for(let j = 0; j < rooms[i].orario.length; j++) {
                if(rooms[i].orario[j].timestamp_from < timeStamp && rooms[i].orario[j].timestamp_to > timeStamp) {
                    rooms.splice(i, 1);
                    i--;
                    break;
                }
            }
        }
    }
    return rooms;
}

//Delete those schedules that are in the past.
function cleanPastSchedule(rooms, timestamp) {
    for(let i = 0; i < rooms.length; i++) {
        for(let j = 0; j < rooms[i].orario.length; j++) {            
            if(timestamp > rooms[i].orario[j].timestamp_from) {
                rooms[i].orario.splice(j,1);
                j --; 
            }   
        }   
    }
    return rooms;
}


//Genera un oggetto contenente ogni room code come proprietà e il relativo id.
function idRoomCode(uri) {
    return fetch(uri)
        .then(response => {
            return response.json()
        })
        .then(json => {
            let areaRooms = json.area_rooms;
            return areaRooms;
        })
        .then(areaRooms => {
            let couple = {};
            Object.keys(areaRooms).map(sede => {
                Object.keys(areaRooms[sede]).map(room => {
                    couple[areaRooms[sede][room ].room_code] = areaRooms[sede][room].id;
                });                  
            });
            return couple;
        })   
        .catch(error => {
            console.log(error);
        }); 

}

function getRoomSchedule(events, roomId) {
    let ris;    
    for(let i = 0; i < events.length; i++) {
        if(events[i].room == roomId) {            
            if(ris == null) {
                if(events[i].Utenti[0] != null) {
                    ris = { room: events[i].room,
                        NomeAula: events[i].NomeAula,            
                        orario: [{
                            nomeMateria : events[i].name,
                            nomeProf : events[i].Utenti[0].Nome + " " + events[i].Utenti[0].Cognome,
                            from: events[i].from,
                            to: events[i].to,
                            timestamp_day: events[i].timestamp_day,
                            timestamp_from: events[i].timestamp_from,
                            timestamp_to: events[i].timestamp_to
                        }]
                    };
                } else {
                    ris = { room: events[i].room,
                        NomeAula: events[i].NomeAula,            
                        orario: [{
                            nomeMateria : events[i].name,                           
                            from: events[i].from,
                            to: events[i].to,
                            timestamp_day: events[i].timestamp_day,
                            timestamp_from: events[i].timestamp_from,
                            timestamp_to: events[i].timestamp_to
                        }]
                    };
                }                      
            } else {
                let newOrario;
                if(events[i].Utenti[0] != null) {
                    newOrario = {
                        nomeMateria : events[i].name,
                        nomeProf : events[i].Utenti[0].Nome + " " + events[i].Utenti[0].Cognome,
                        from: events[i].from,
                        to: events[i].to,
                        timestamp_day: events[i].timestamp_day,
                        timestamp_from: events[i].timestamp_from,
                        timestamp_to: events[i].timestamp_to
                    };
                } else {
                    newOrario = {
                        nomeMateria : events[i].name,
                        from: events[i].from,
                        to: events[i].to,
                        timestamp_day: events[i].timestamp_day,
                        timestamp_from: events[i].timestamp_from,
                        timestamp_to: events[i].timestamp_to
                    };
                }
                ris.orario.push(newOrario);
            }
        }
    }

    return ris == null ? "Nessuna lezione oggi in questa aula" : ris;
}

app.get('/schedule/:sede/:aula', (req, res) => {
    let now = new Date();
    let day = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    let sede = req.params.sede;  //Id della sede
    let room= req.params.aula;  //nome aula
    let roomCode = sede + '/' + room;

    let url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede=" + sede + "&_lang=it&date=20-11-2017";
    idRoomCode(url)
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
            
            let room = getRoomSchedule(events, id); //otteniamo lo schedule della stanza prescelta e lo inviamo come json
            
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
    
    //console.log("INIZIO GET BY MY CURRENT POSITION");
    let lat = req.query.lat;
    let lng = req.query.lng;

    let userCoord = {latitude:lat, longitude:lng};
    let nearestLocationInfo = getNearestLocation(userCoord);
    let nearestLocation = nearestLocationInfo.key;

    let url;
    if (inArray(nearestLocation))
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
            let rooms = getRoomList(events); 
            rooms = cleanSchedule(rooms);    
            rooms = getFreeRooms(rooms, currentTimestamp);
            rooms = cleanPastSchedule(rooms, currentTimestamp);
            res.json(rooms); //Get the list of rooms with events that day and the hours in which they are busy.
        })
        .catch(error => {
            console.log(error);
        });
    }
    
});


function getNearestLocation(userCoord) {
    return geolib.findNearest(userCoord, dep_coordinates, 1);
}


app.listen(port);
console.log("Server started on port " + port);


module.exports = {inArray, getRoomList};