
var possibilities = ["povo","economia","lettere","filosofia","mesiano",
					"ingegneria","giurisprudenza","sociologia","scienze cognitive",
					"giuri","socio","help"];

function contains(arr, element) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] === element) {
		return true;
		}
	}
	return false;
}

function delay(t) {
	return new Promise(function(resolve) { 
		setTimeout(resolve, t)
	});
}

function showCommand(){
	console.log("showCommand")
	var table = document.getElementById("table_div");
	table.style.visibility = "visible";

}

//funzione per chiamare result.html con la query inserita dall'utente
function go(){
	var q = document.getElementById("inserisci").value;
	//prima bisogna parsare la q e poi aggiungere il parametro polo/aula all'url
	var url = "result.html?q="+q;

	location.href = url;
}


function getQueryVariable(url_string,param) {
	var url = new URL(url_string);
	var query = url.searchParams.get(param);
	console.log("getQueryVariable = "+query);
	if(query)
		return query;
	return null;
}


//funzione per prendere la query inserita dall'utente
function getQueryVariable_q(url_string) {
	var url = new URL(url_string);
	var query = url.searchParams.get("q");
	console.log("getQueryVariable_q = "+query);
	if(query)
		if(contains(possibilities,query))
			return query;
		else if (query === "dc")
			return query;
		else
			return null;
	return null;
}

function getQueryVariable_geoloc(url_string) {
	var url = new URL(url_string);
	var query = url.searchParams.get("geoloc");
	if(query)
		return query;
	return null;
	//alert('Query Variable ' + query + ' not found');
}

