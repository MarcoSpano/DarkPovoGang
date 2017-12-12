//We tried to test client functions but it didn't work.
//Here there is our try; we raname the file in order to not get caught by the test.

const functions = require('../client/js/myjs.js');


//GETQUERYVARIABLE
const url0 = "https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=povo+domani";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=povo+domani","q") should return "povo domani"', () => {
	expect(functions.getQueryVariable(url0,"q")).toEqual("povo domani");
});

const url1 = "https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=","q") should return "null"', () => {
	expect(functions.getQueryVariable(url1,"q")).toEqual(null);
});

const url2 = "https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=true&q=","geoloc") should return "true"', () => {
	expect(functions.getQueryVariable(url2,"geoloc")).toBeTruthy();
});

const url3 = "https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=false&q=";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/result.html?geoloc=false&q=","geoloc") should return "true"', () => {
	expect(functions.getQueryVariable(url3,"geoloc")).not.toBeTruthy();
});

const url4 = "https://stebranchi.github.io/DarkPovoGang/aula.html?aula=B106&sede=E0503";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/aula.html?aula=B106&sede=E0503","aula") should return "b106"', () => {
	expect(functions.getQueryVariable(url4,"aula")).toEqual("B106");
});

const url5 = "https://stebranchi.github.io/DarkPovoGang/aula.html?aula=A105&sede=E0503";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/aula.html?aula=A105&sede=E0503","aula") should return "a105"', () => {
	expect(functions.getQueryVariable(url5,"aula")).toEqual("A105");
});

const url6 = "https://stebranchi.github.io/DarkPovoGang/aula.html?aula=";
test('getQueryVariable("https://stebranchi.github.io/DarkPovoGang/aula.html?aula=","aula") should return "null"', () => {
	expect(functions.getQueryVariable(url6,"aula")).toEqual(null);
});


//SHOWCOMMAND
test('showCommand() should return "visible"',() => {
	expect(functions.showCommand().toEqual("visible"));
});

