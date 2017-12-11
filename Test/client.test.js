const functions = require('../client/js/myjs.js');


//GETQUERYVARIABLE
let url = "https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=povo+domani";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=povo+domani","q") should return "povo domani"', () => {
	expect(functions.getQueryVariable(url,"q")).toEqual("povo domani");
});

url = "https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=","q") should return "null"', () => {
	expect(functions.getQueryVariable(url,"q")).toEqual(null);
});

url = "https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=","geoloc") should return "true"', () => {
	expect(functions.getQueryVariable(url,"geoloc")).toBeTruthy();
});

url = "https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=false&q=";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=false&q=","geoloc") should return "true"', () => {
	expect(functions.getQueryVariable(url,"geoloc")).not.toBeTruthy();
});

url = "https://stebranchi.github.io/DarkPovoGang/aula.html?aula=B106&sede=E0503";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/aula.html?aula=B106&sede=E0503","aula") should return "b106"', () => {
	expect(functions.getQueryVariable(url,"aula")).toEqual("B106");
});

url = "https://stebranchi.github.io/DarkPovoGang/aula.html?aula=A105&sede=E0503";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/aula.html?aula=A105&sede=E0503","aula") should return "a105"', () => {
	expect(functions.getQueryVariable(url,"aula")).toEqual("A105");
});

url = "https://stebranchi.github.io/DarkPovoGang/aula.html?aula=";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/aula.html?aula=","aula") should return "null"', () => {
	expect(functions.getQueryVariable(url,"aula")).toEqual(null);
});


//SHOWCOMMAND
test('showCommand() should return "visible"',() => {
	expect(functions.showCommand().toEqual("visible"));
});

