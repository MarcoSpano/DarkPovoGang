const fetch = require("node-fetch");
const geolib = require("geolib");
const dataStruct = require('./data');

function inArray(sede){
    if(sede === undefined) {
        throw new Error('No parameter inserted');
    }
    if(typeof sede != "string") {
        throw new TypeError('No string parameter inserted');
    }
    for (let i = 0; i < dataStruct.department_id.length; i++)
    {
        if(sede === dataStruct.department_id[i])
            return true;
    }
    return false;
}


function getRoomList(events) {
    if(events === undefined) {
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
    if(rooms === undefined) {
        throw new Error('No parameter inserted');
    }
    if(typeof rooms != "object") {
        throw new TypeError('No object parameter inserted');
    }
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
    if(rooms === undefined)  {
        throw new Error('No parameter inserted')
    }
    if(typeof rooms != "object" || typeof timeStamp != "number") {
        throw new TypeError("Wrong parameters' type");
    }
    if(timeStamp <= 0) {
        throw new Error("Timestamp can't be null or negative");
    }
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
    if(rooms === undefined)  {
        throw new Error('No parameter inserted')
    }
    if(typeof rooms != "object" || typeof timestamp != "number") {
        throw new TypeError("Wrong parameters' type");
    }
    if(timestamp <= 0) {
        throw new Error("Timestamp can't be null or negative");
    }
    for(let i = 0; i < rooms.length; i++) {
        for(let j = 0; j < rooms[i].orario.length; j++) {            
            if(timestamp > rooms[i].orario[j].timestamp_from) {
                rooms[i].orario.splice(j,1);
                j--; 
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


function getNearestLocation(userCoord) {
    return geolib.findNearest(userCoord, dataStruct.dep_coordinates, 1);
}


module.exports = {inArray, getRoomList, cleanSchedule, getFreeRooms,
                cleanPastSchedule, idRoomCode, getRoomSchedule, getNearestLocation};