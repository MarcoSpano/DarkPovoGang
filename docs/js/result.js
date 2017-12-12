let url;
//script per creare la tabella degli orari
var frase = getQueryVariable(window.location.href,"q");
var geoloc = getQueryVariable(window.location.href,"geoloc");
if (frase != null) {
    
    if (frase == "help")
        location.href = "index.html?q=help";
    url = "https://uniroomtn.herokuapp.com/nl?frase="+ frase;
    $.getJSON(url, function (data) {
        if(data.includes("aula.html")){
            location.href = data;
        }
        else if((data.includes("Nessuna"))||(data == null)||(data == undefined)){
            $("#command_table").append("<tr><td>Nessuna aula disponibile</td><td></td><td></td></tr>");
        }
        else if(data == "Errore!"){
            location.href = "index.html?q=dc";
        }
        else{
            let time = data[0].time;
            let orario;
            if(time == null){
                    let date = new Date();
                    let min = date.getMinutes();
                    let hour = date.getHours();
                    let s;
                    if(min < 10)
                        s = hour + ":0" + min + ":00";
                    else
                        s = hour + ":" + min + ":00";
                    orario = s;
                } else {
                    orario = time;
                }
            $.each(data, function (key, val) {						
                if (val.orario[0]) {
                    $("#command_table").append("<tr><td>" + val.NomeAula + "</td><td>" + orario + "</td><td>" + val.orario[0].from + "</td></tr>");
                }
                else {
                    $("#command_table").append("<tr><td>" + val.NomeAula + "</td><td>" + orario + "</td><td>fine giornata</td></tr>");
                }

            });
        }
        
    });
} 
else if(geoloc != null)
{
    var getPosition = function (options) {
        return new Promise(function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    }

    getPosition()
    .then((position) => {
        document.getElementById("nome_polo").innerHTML = "Ricerca in corso";
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        fetch("https://uniroomtn.herokuapp.com/room?lat="+ lat + "&&lng=" + lng)
        .then(ris => {
            let data = ris.json();
            data.then(result => {
                console.log(result);
                if(result == "Nessuna aula disponibile al momento")
                    var name = "Nessuna aula libera vicino a te";
                else 
                    var name = "Aule libere presso: " + result[0].sede;
                document.getElementById("nome_polo").innerHTML = name;
                $.each(result, function (key, val) 
                    {
                    if (val.orario[0]) 
                    {
                        $("#command_table").append("<tr><td>" + val.NomeAula + "</td><td>ora</td><td>" + val.orario[0].from + "</td></tr>");
                    }
                    else 
                    {
                        $("#command_table").append("<tr><td>" + val.NomeAula + "</td><td>ora</td><td>fine giornata</td></tr>");
                    }
                });
            })
            .catch((err) => {
                console.error(err.message);
            })					
        })
    })
    .catch((err) => {
        console.error("Errore nella geo" + err.message);
    });		
}
else {
    location.href = "index.html?q=dc";
}
//script per caricare il titolo
var x="Povo6: " + frase;
//polo = polo.replace("%20", " ");
if(frase != null) {
    frase = frase.replace("+", " ");
    var name = "Risultati per: " + frase;			
} else {
    var name = "Tentativo di utilizzo geolocalizzazione";
}
document.getElementById("nome_polo").innerHTML = name;