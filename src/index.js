const corpus = require("./corpus.js");

// var projectionBounds = [-20026376.39, -20048966.10, 20026376.39, 20048966.10];
const projectionBounds = [-20026375, -20048965, 20026375, 20048965];
var boundsX = (projectionBounds[2] - projectionBounds[0])
var boundsY = (projectionBounds[3] - projectionBounds[1])
const blockArea = 3; // 3msq
const corpusSize = 8000;

export class OpenGeoWords {
    
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

    static getCorpus() {
        return corpus;
    }

    // EPSG 3857
    static project(lonlat) {
        var x = (lonlat[0] * 20037508.34) / 180;
        var y = Math.log(Math.tan(((90 + lonlat[1]) * Math.PI) / 360)) / (Math.PI / 180);
        y = (y * 20037508.34) / 180;
        return [x, y];
    }

    static unproject(meters) {
        var lon = meters[0] *  180 / 20037508.34 ;
        var lat = Math.atan(Math.exp(meters[1] * Math.PI / 20037508.34)) * 360 / Math.PI - 90; 
        return [lon, lat]
    }

    static generateWords(lonlat) {

        var meters = OpenGeoWords.project(lonlat);
        var blockX = Math.round((meters[0] - projectionBounds[0]) / 3);
        var blockY = Math.round((meters[1] - projectionBounds[1]) / 3);

        var blockPosition = blockY * boundsX + blockX;

        var part1 = Math.floor(blockPosition / corpusSize);
        var part1r = blockPosition % corpusSize;

        var part2 = Math.floor(part1 / corpusSize);
        var part2r = part1 % corpusSize;

        var part3 = Math.floor(part2 / corpusSize);
        var part3r = part2 % corpusSize;

        var part4 = Math.floor(part3 / corpusSize);
        var part4r = part3 % corpusSize;

        return [corpus[part1r], corpus[part2r], corpus[part3r], corpus[part4r]];
    }

    static generateWordsString(lonlat) {
        var words = OpenGeoWords.generateWords(lonlat);

        return "///" + words[0] + "." + words[1] + "." + words[2] + "." + words[3]
    }

    static parseWordsString(text) {
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

        if(part1r == -1 || part2r == -1 || part3r == -1 || part4r == -1) {
            return null;
        }

        var blockPosition = part4r * corpusSize * corpusSize * corpusSize + part3r * corpusSize * corpusSize + part2r * corpusSize + part1r;

        var blockY = Math.floor(blockPosition / boundsX);
        var blockX = blockPosition % boundsX;


        var meters = [
            blockX * 3 + projectionBounds[0],
            blockY * 3 + projectionBounds[1],
        ]

        var coordinates = OpenGeoWords.unproject(meters);

        return coordinates;
    }

    // reverseCalculateParts(20, 25000); // 3
    static reverseCalculateParts(blockArea = 3, corpusSize = corpusSize) {
        var maxBlocks = boundsX / blockArea * boundsY / blockArea

        var parts = 1;
        while(maxBlocks > corpusSize) {
            maxBlocks = Math.ceil(maxBlocks / corpusSize);
            parts++;
        }

        return {maxBlocks, parts};
    }

    // reverseCalculateCorpus(3, 3); // 56299.42093061066 (need this for 3 parts and 3msq area)
    static reverseCalculateCorpus(blockArea = 20, parts = 3) {
        var maxBlocks = boundsX / blockArea * boundsY / blockArea

        var corpusSize = Math.pow(maxBlocks, 1 / parts);
        
        return {maxBlocks, corpusSize};
    }


}