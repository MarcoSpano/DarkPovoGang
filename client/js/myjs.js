function showCommand(){
	console.log("showCommand")
	var table = document.getElementById("table_div");
	table.style.visibily = "visible"

}

//funzione per chiamare result.html con la query inserita dall'utente
function go(){
	var q = document.getElementById("inserisci").value;

	if (q === "help")
	{
		console.log("q == help")
		showCommand();
	}
	else
	{
		//prima bisogna parsare la q e poi aggiungere il parametro polo/aula all'url
		var url = "result.html?q="+q;

		location.href = url;
	}
}
//funzione per prendere la query inserita dall'utente
function getQueryVariable_q(url_string) {
	var url = new URL(url_string);
	var query = url.searchParams.get("q");
	if(query)
		return query;
	return null;
	//alert('Query Variable ' + query + ' not found');
}
function getQueryVariable_geoloc(url_string) {
	var url = new URL(url_string);
	var query = url.searchParams.get("geoloc");
	if(query)
		return query;
	return null;
	//alert('Query Variable ' + query + ' not found');
}
