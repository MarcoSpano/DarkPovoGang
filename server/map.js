const cheerio = require('cheerio');
const svg2png=require('svg2png');
const fs=require('pn/fs');


function getMaps(rooms,sede){
    var output;
    var sourceBuffer;

    switch(sede){
        case 'E0503':

        //Povo A piano P1
        var $ = cheerio.load(fs.readFileSync(path.join(__dirname+'/../img/Povo1P1.svg')));
            for(i = 0; i<rooms.length;i++){
                if(rooms[i].room <= 437 && rooms[i].room >= 414){
                    var id = 201 + (437 - rooms[i].room) ;
                    var stringa = "#a" + id;
                    var rect = $(stringa);
                    rect.attr('fill','green');
                    }
            }
       // output = new Buffer( $.html() );

        //Povo A piano PT
        $ = cheerio.load(fs.readFileSync(path.join(__dirname+'/../img/Povo1PT.svg')));
            for(i = 0; i<rooms.length;i++){
                if(rooms[i].room <= 445 && rooms[i].room >= 438){
                    var id = 101 + (445 - rooms[i].room) ;
                    var stringa = "#a" + id;
                    var rect = $(stringa);
                    rect.attr('fill','green');
                    }
            }
       // output =  $.html();
    }

      //Povo B piano P1
        $ = cheerio.load(fs.readFileSync(path.join(__dirname+'/../img/Povo2P1.svg')));
            for(i = 0; i<rooms.length;i++){
                if(rooms[i].room <= 403 && rooms[i].room >= 402){
                    var id = 106 + (403 - rooms[i].room) ;
                    var stringa = "#b" + id;
                    var rect = $(stringa);
                    rect.attr('fill','green');
                    }
            }
        // output = $.html();

         //Povo B piano PT
         $ = cheerio.load(fs.readFileSync(path.join(__dirname+'/../img/Povo2PT.svg')));
            for(i = 0; i<rooms.length;i++){
                if(rooms[i].room <= 408 && rooms[i].room >= 404){
                    var id = 101 + (408 - rooms[i].room) ;
                    var stringa = "#b" + id;
                    var rect = $(stringa);
                    rect.attr('fill','green');
                    }
            }
          output=  $.html();
        //console.log(output);

    return output;

}

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


module.exports = {getMaps, conversionMap};