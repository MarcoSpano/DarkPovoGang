var TelegramBot = require('node-telegram-bot-api'),
		telegram = new TelegramBot("392455215:AAFbwqA9OjK8H0HUG02PEGt14q4lDoywo6M", { polling: true });
const express = require('express');
const path = require("path");
const request = require('request');
const cors = require('cors');
const svg2png=require('svg2png');
const mapper = require('./server/server.js');
const fetch = require("node-fetch");

var povo1p1 = '/img/Povo1P1.svg';
var povo1pt = '/img/Povo1PT.svg';
var povo2p1 = '/img/Povo2P1.svg';
var povo2pt = '/img/Povo2PT.svg';

function getRoomList(events) {
    //console.log("INIZIO GETROOMLIST");
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
    //console.log("FINE GETROOMLIST");
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

function getData(sede){
	let rooms = [];
	let now = new Date();
	let day = now.getDate();
	let month = now.getMonth() + 1;
	let year = now.getFullYear();
	let currentTimestamp = now.getTime() / 1000; 
	url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede="+sede+"&_lang=it&date=" + day + "-" + month + "-" + year;
	return fetch(url)
	.then(body => {
			return body.json();
	})
	.then(data => {
			return data.events;
	})
	.then(events => {
			console.log("sono arrivato qua!");
			rooms = getRoomList(events); 
			rooms = cleanSchedule(rooms);    
			rooms = getFreeRooms(rooms, currentTimestamp);
			rooms = cleanPastSchedule(rooms, currentTimestamp);
			return rooms;
	})
	.catch(error => {
			console.log("Errore nel parsing json: "+error);
	});
}

function getDataAndMaps(sede, id){

	let rooms = [];
	let now = new Date();
	let day = now.getDate();
	let month = now.getMonth() + 1;
	let year = now.getFullYear();
	let currentTimestamp = now.getTime() / 1000;
	var sourceBuffer; 
	url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede="+sede+"&_lang=it&date=" + day + "-" + month + "-" + year;

	return fetch(url)
	.then(body => {
			return body.json();
	})
	.then(data => {
			return data.events;
	})
	.then(events => {
			console.log("sono arrivato qua!");
			rooms = getRoomList(events); 
			rooms = cleanSchedule(rooms);    
			rooms = getFreeRooms(rooms, currentTimestamp);
			rooms = cleanPastSchedule(rooms, currentTimestamp);
			//console.log(rooms);
			return rooms;
	})
	.then(rooms => {
		var maps = mapper.getMaps(rooms,sede);
		//console.log(maps);
		return maps;
	})
	.then(maps => {
		var sourceBuffer;
  	  	svg2png(maps)
    	.then(function (buffer) {
    		//console.log("convertito!");
        	sourceBuffer = new Buffer(buffer, 'base64');
        	//console.log(sourceBuffer); 
        	telegram.sendPhoto(id,sourceBuffer);       
    	})
    	.catch(function (error) {
        	console.log("Conversion Error! "+error);
    	});
    	//console.log(sourceBuffer);
	})
	.catch(error => {
			console.log("Errore nel parsing json: "+error);
	});
}




telegram.on("text", (message) => {
	if (message.text == "/start")
	{
		telegram.sendMessage(message.chat.id, "Ciao! Grazie a questo bot puoi sapere le aule di Unitn libere del dipartimento che vuoi! Digita /help per sapere i comandi disponibili.");
	}
	else if (message.text == "/help")
	{
		telegram.sendMessage(message.chat.id, "I comandi disponibili sono: \n*/help* \n*/start* \n*/povo* \n*/socio* \n*/economia* \n*/scicogn* \n*/lettere* \n*/giuri* \n*/mesiano* \n*/filosofia*", {parse_mode: "Markdown"}); 
	}
	else if (message.text.toLowerCase().includes("povo"))
	{
		let sede = "E0503";
		let msg = "ciao";
		var maps = getDataAndMaps(sede, message.chat.id);
		let rooms = getData(sede).then(rooms => {
			for(let i = 0; i < rooms.length; i++){
				for(let j = 0; j < rooms[i].orario.length; j++){
					msg = rooms[i].NomeAula+" libera fino alle "+rooms[i].orario[j].from+"\n";
				}
			}
            if(msg.includes("ciao"))
            {
                msg = "l'uni è chiusa, sta a casa!";
                telegram.sendMessage(message.chat.id, msg);
            }
            else
            {    
                telegram.sendMessage(message.chat.id, msg);	
            }
		});
	}
	else if (message.text.toLowerCase().includes("ingegneria") || message.text.toLowerCase().includes("mesiano"))
	{
		let sede = "E0301";
		let msg = "";
		let rooms = getData(sede).then(rooms => {
			for(let i = 0; i < rooms.length; i++){
				for(let j = 0; j < rooms[i].orario.length; j++){
					msg += ""+rooms[i].NomeAula+" libera fino alle "+rooms[i].orario[j].from+"\n";
				}
			}
			telegram.sendMessage(message.chat.id, msg);	
		});
	}
	else if (message.text.toLowerCase().includes("giurisprudenza") || message.text.toLowerCase().includes("giuri"))
	{
		let sede = "E0201";
		let msg = "";
		let rooms = getData(sede).then(rooms => {
			for(let i = 0; i < rooms.length; i++){
				for(let j = 0; j < rooms[i].orario.length; j++){
					msg += ""+rooms[i].NomeAula+" libera fino alle "+rooms[i].orario[j].from+"\n";
				}
			}
			telegram.sendMessage(message.chat.id, msg);	
		});
	}
	else if (message.text.toLowerCase().includes("sociologia") || message.text.toLowerCase().includes("socio"))
	{
		let sede = "E0601";
		let msg = "";
		let rooms = getData(sede).then(rooms => {
			for(let i = 0; i < rooms.length; i++){
				for(let j = 0; j < rooms[i].orario.length; j++){
					msg += ""+rooms[i].NomeAula+" libera fino alle "+rooms[i].orario[j].from+"\n";
				}
			}
			telegram.sendMessage(message.chat.id, msg);	
		});
	}
	else if (message.text.toLowerCase().includes("filosofia") || message.text.toLowerCase().includes("lettere"))
	{
		let sede = "E0801";
		let msg = "";
		let rooms = getData(sede).then(rooms => {
			for(let i = 0; i < rooms.length; i++){
				for(let j = 0; j < rooms[i].orario.length; j++){
					msg += ""+rooms[i].NomeAula+" libera fino alle "+rooms[i].orario[j].from+"\n";
				}
			}
			telegram.sendMessage(message.chat.id, msg);	
		});
	}
	else if (message.text.toLowerCase().includes("scienze cognitive") || message.text.toLowerCase().includes("scicogn"))
	{
		let sede = "E0705";
		let msg = "";
		let rooms = getData(sede).then(rooms => {
			for(let i = 0; i < rooms.length; i++){
				for(let j = 0; j < rooms[i].orario.length; j++){
					msg += ""+rooms[i].NomeAula+" libera fino alle "+rooms[i].orario[j].from+"\n";
				}
			}
			telegram.sendMessage(message.chat.id, msg);	
		});
	}
	else if (message.text.toLowerCase().includes("economia"))
	{
		let sede = "E0101";
		let msg = "";
		let rooms = getData(sede).then(rooms => {
			for(let i = 0; i < rooms.length; i++){
				for(let j = 0; j < rooms[i].orario.length; j++){
					msg += ""+rooms[i].NomeAula+" libera fino alle "+rooms[i].orario[j].from+"\n";
				}
			}
			telegram.sendMessage(message.chat.id, msg);	
		});
	}
	else
    {
		telegram.sendMessage(message.chat.id,"Comando non riconosciuto! Digita /help per conoscere la lista dei comandi.")
	}
});