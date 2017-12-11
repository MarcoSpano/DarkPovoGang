const functions = require('../client/js/myjs.js');


//GETQUERYVARIABLE
let url = "https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=povo+domani";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=povo+domani","q") should return "povo domani"', () => {
	expect(functions.getQueryVariable(url,"q")).toEqual("povo domani");
});

url = "https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=povo+domani","q") should return "null"', () => {
	expect(functions.getQueryVariable(url,"q")).toEqual(null);
});

url = "https://stebranchi.github.io/DarkPovoGang/aula.html?aula=b106";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=povo+domani","q") should return "b106"', () => {
	expect(functions.getQueryVariable(url,"aula")).toEqual("b106");
});

url = "https://stebranchi.github.io/DarkPovoGang/aula.html?aula=a105";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/aula.html?aula=a105","q") should return "a105"', () => {
	expect(functions.getQueryVariable(url,"aula")).toEqual("a105");
});

url = "https://stebranchi.github.io/DarkPovoGang/aula.html?aula=";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/aula.html?aula=a105","q") should return "null"', () => {
	expect(functions.getQueryVariable(url,"aula")).toEqual(null);
});


//SHOWCOMMAND
test('showCommand() should return "visible"',() => {
	expect(functions.showCommand().toEqual("visible"));
});

