// EPSG 3395 was ditched because unproject formula was a bad approximation. Its more optimized though
// var projectionBounds = [-20026376.39, -15496570.74, 20026376.39, 18764656.23];
// var projectionBounds = [-20026376, -15496570, 20026376, 18764656];

// // EPSG 3395
// function project(lonlat) {
//     var lon = lonlat[0] / 180 * Math.PI;
//     var lat = lonlat[1] / 180 * Math.PI;
    
//     var a = 6378137              // WGS84 semi-major axis
//     var b = 6356752.3142         // WGS84 semi-minor axis
//     var e = Math.sqrt(1 - Math.pow(b, 2) / Math.pow(a, 2))  // ellipsoid eccentricity

//     var c = Math.pow((1 - e*Math.sin(lat)) / (1 + e*Math.sin(lat)), e/2)
//     var y = a * Math.log(Math.tan(Math.PI/4 + lat/2) * c)

//     var x = a * lon;

//     return [x, y];
// }

// // EPSG 3395
// // So this was a headache
// // https://gis.stackexchange.com/questions/116804/improving-accuracy-of-mercator-meters-conversion-to-lat-lon
// // https://pubs.usgs.gov/pp/1395/report.pdf (page 44)
// function unproject(meters) {
    
//     var a = 6378137              // WGS84 semi-major axis
//     var b = 6356752.3142         // WGS84 semi-minor axis
//     var e = Math.sqrt(1 - Math.pow(b, 2) / Math.pow(a, 2))  // ellipsoid eccentricity

//     var lon = (meters[0] / a) / Math.PI * 180; 
//     var lat = Math.atan(Math.tan(Math.atan(Math.exp(meters[1] / 6378388.0)) * 2.0 - 1.570796326794897) * 1.0067642927) * 57.295779513082302;

//     return [lon, lat];
// }

// var projectionBounds = [-20026376.39, -20048966.10, 20026376.39, 20048966.10];
var projectionBounds = [-20026375, -20048965, 20026375, 20048965];

// EPSG 3857
function project(lonlat) {
    var x = (lonlat[0] * 20037508.34) / 180;
    var y = Math.log(Math.tan(((90 + lonlat[1]) * Math.PI) / 360)) / (Math.PI / 180);
    y = (y * 20037508.34) / 180;
    return [x, y];
}

function unproject(meters) {
    var lon = meters[0] *  180 / 20037508.34 ;
    var lat = Math.atan(Math.exp(meters[1] * Math.PI / 20037508.34)) * 360 / Math.PI - 90; 
    return [lon, lat]
}



var boundsX = (projectionBounds[2] - projectionBounds[0])
var boundsY = (projectionBounds[3] - projectionBounds[1])
var blockArea = 3; // 3msq
var maxBlocks = boundsX / blockArea * boundsY / blockArea
// console.log(maxBlocks);


function generateWords(lonlat) {

    var meters = project(lonlat);
    var blockX = Math.round((meters[0] - projectionBounds[0]) / 3);
    var blockY = Math.round((meters[1] - projectionBounds[1]) / 3);

    // console.log(lonlat);
    // console.log(meters);

    // maxBlocks                    = 178448058456540.47
    // 8000 * 8000 * 8000 * 8000    = 4096000000000000.     max results from 4 pairs of 8k list
    // 8000 * 8000 * 8000           = 512000000000.         max results from 3 pairs of 8k list
    // 55000 * 55000 * 55000        = 166375000000000.      max results from 3 pairs of 55k list (we need a corpus this big for 3 pair of 3msq)

    var blockPosition = blockY * boundsX + blockX;

    var part1 = Math.floor(blockPosition / 8000);
    var part1r = blockPosition % 8000;

    var part2 = Math.floor(part1 / 8000);
    var part2r = part1 % 8000;

    var part3 = Math.floor(part2 / 8000);
    var part3r = part2 % 8000;

    var part4 = Math.floor(part3 / 8000);
    var part4r = part3 % 8000;
    
    // console.log(part1r, part2r, part3r, part4r);
    // console.log(blockPosition);
    // console.log(blockX, blockY);

    return [corpus[part1r], corpus[part2r], corpus[part3r], corpus[part4r]];

}

function generateWordsString(lonlat) {
    var words = generateWords(lonlat);

    return "///" + words[0] + "." + words[1] + "." + words[2] + "." + words[3]
}

function parseWordsString(text) {
    var text = text.replace(/\s/g,'');
    if(!text.startsWith("///")) {
        return null;
    }

    text = text.substring(3, text.length);
    var words = text.split(".");

    if(words.length != 4) {
        return null;
    }

    var part1r = corpus.indexOf(words[0]);
    var part2r = corpus.indexOf(words[1]);
    var part3r = corpus.indexOf(words[2]);
    var part4r = corpus.indexOf(words[3]);

    var blockPosition = part4r * 8000 * 8000 * 8000 + part3r * 8000 * 8000 + part2r * 8000 + part1r;
    // console.log(blockPosition);

    var blockY = Math.floor(blockPosition / boundsX);
    var blockX = blockPosition % boundsX;


    var meters = [
        blockX * 3 + projectionBounds[0],
        blockY * 3 + projectionBounds[1],
    ]

    var coordinates = unproject(meters);

    return coordinates;
    
    // console.log(coordinates);

    // console.log(part1r, part2r, part3r, part4r);
}

function haversineDistance(coords1, coords2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    var lon1 = coords1[0];
    var lat1 = coords1[1];

    var lon2 = coords2[0];
    var lat2 = coords2[1];

    lon1 = lon1 = (lon1 % 360 + 360) % 360;
    lon2 = lon2 = (lon1 % 360 + 360) % 360;

    var R = 6371; // km

    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2)
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d * 1000;
}

// map.on('pointermove', function (evt) {
//     var lonlat  = ol.proj.toLonLat(evt.coordinate);
//     var text = generateWordsString(lonlat)
//     var lonlat2 = parseWordsString(text);

//     var distance = haversineDistance(lonlat, lonlat2);

//     if(distance > 3) {
//         console.error(distance, lonlat, lonlat2);
//     } else {
        
//         console.log(distance, text);
//     }
// });

function reverseCalculateParts(blockArea = 3, corpusSize = 8000) {

    var maxBlocks = boundsX / blockArea * boundsY / blockArea

    console.log("maxBlocks", maxBlocks)

    var parts = 1;
    while(maxBlocks > corpusSize) {
        maxBlocks = Math.ceil(maxBlocks / corpusSize);
        parts++;
    }

    console.log("parts", parts);

}

function reverseCalculateCorpus(blockArea = 20, parts = 3) {

    var maxBlocks = boundsX / blockArea * boundsY / blockArea

    console.log("maxBlocks", maxBlocks)

    var corpusSize = Math.pow(maxBlocks, 1 / parts);

    console.log("corpusSize", corpusSize)

}

// reverseCalculateParts(20, 25000); // 3

reverseCalculateCorpus(3, 3); // 56299.42093061066 (need this for 3 parts and 3msq area)

// var lonlat  = [73.0479, 33.6844];
// var text = generateWordsString(lonlat)
// var lonlat2 = parseWordsString(text);

// var distance = haversineDistance(lonlat, lonlat2);
// console.log(distance);
