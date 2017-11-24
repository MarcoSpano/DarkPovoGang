var TelegramBot = require('node-telegram-bot-api'),
		telegram = new TelegramBot("392455215:AAFbwqA9OjK8H0HUG02PEGt14q4lDoywo6M", { polling: true });
const express = require('express');
const path = require("path");
const request = require('request');
const cors = require('cors');
const svg2png=require('svg2png');
const fetch = require("node-fetch");



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
			console.log("SECONDO .then");
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
var p1p1;
var p1pt;
var p2p1;
var p2pt;
var povo1p1 = conversionMap('/img/Povo1P1.svg', p1p1);
var povo1pt = conversionMap('/img/Povo1PT.svg', p1pt);
var povo2p1 = conversionMap('/img/Povo2P1.svg', p2p1);
var povo2pt = conversionMap('/img/Povo2PT.svg', p2pt);
//var photo = 'photo_2017-10-12_10-39-45.jpg';

telegram.on("text", (message) => {
	if (message.text == "/start")
	{
		telegram.sendMessage(message.chat.id, "Ciao, i comandi disponibili sono: \n*/help* \n*/start* \n*/povo* \n*/socio* \n*/economia* \n*/scicogn* \n*/lettere* \n*/giuri* \n*/mesiano* \n*/filosofia*", {parse_mode: "Markdown"});
	}
	else if (message.text == "/help")
	{
		telegram.sendMessage(message.chat.id, "i comandi disponibili sono: \n/help \n/start \n/povo \n/socio \n/economia \n/scicogn \n/lettere \n/giuri \n/mesiano \n/filosofia"); 
	}
	else if (message.text.toLowerCase().includes("povo"))
	{
		let sede = "E0503";
		let msg = "";
		let rooms = getData(sede).then(rooms => {
			for(let i = 0; i < rooms.length; i++){
				msg += ""+rooms[i].NomeAula+" libera fino alle "+rooms[i].orario[0].from+"\n";
			}
			telegram.sendMessage(message.chat.id, msg);
		});
//<<<<<<< HEAD
		telegram.sendPhoto(message.chat.id, photo);
//=======
		
			
		//telegram.sendMessage(message.chat.id, povo1p1, {caption: "aule libere polo A"});
//>>>>>>> 9c74038bf85c45c3302d8d60752d35d575a13ae9
	}
	else if (message.text.toLowerCase().includes("ingegneria"))
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
	else if (message.text.toLowerCase().includes("mesiano"))
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
	else if (message.text.toLowerCase().includes("giurisprudenza"))
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
	else if (message.text.toLowerCase().includes("giuri"))
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
	else if (message.text.toLowerCase().includes("sociologia"))
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
	else if (message.text.toLowerCase().includes("socio"))
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
	else if (message.text.toLowerCase().includes("filosofia"))
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
	else if (message.text.toLowerCase().includes("lettere"))
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
	else if (message.text.toLowerCase().includes("scienze cognitive"))
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
	else if (message.text.toLowerCase().includes("scicogn"))
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

//Function to convert SVG files in PNG
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