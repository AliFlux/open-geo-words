import {corpus, corpusIndex} from './corpus.js'
// const {corpus, corpusIndex} = require("./corpus.js");

// const proj4 = require("proj4");
import proj4 from 'proj4'

// 3857
// var projectionBounds = [-20026376.39, -20048966.10, 20026376.39, 20048966.10];
// const projectionBounds = [-20026375, -20048965, 20026375, 20048965];

// 3395
// var projectionBounds = [-20026376.39, -15496570.74, 20026376.39, 18764656.23];
// var projectionBounds = [-20026376, -15496570, 20026376, 18764656];

// 32662
// var projectionBounds = [-20026376.39, -9462156.72, 20026376.39, 9462156.72];
var projectionBounds = [-20026376, -9462156, 20026377, 9462157];

proj4.defs("EPSG:3395","+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs");
proj4.defs("EPSG:32662","+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs");

var boundsX = (projectionBounds[2] - projectionBounds[0])
var boundsY = (projectionBounds[3] - projectionBounds[1])
const blockArea = 4; // 3msq?
const corpusSize = 58215; // words.length

export class OpenGeoWords {

    // // EPSG 3857
    // static project(lonlat) {
    //     var x = (lonlat[0] * 20037508.34) / 180;
    //     var y = Math.log(Math.tan(((90 + lonlat[1]) * Math.PI) / 360)) / (Math.PI / 180);
    //     y = (y * 20037508.34) / 180;
    //     return [x, y];
    // }

    // static unproject(meters) {
    //     var lon = meters[0] *  180 / 20037508.34 ;
    //     var lat = Math.atan(Math.exp(meters[1] * Math.PI / 20037508.34)) * 360 / Math.PI - 90; 
    //     return [lon, lat]
    // }

    // EPSG 32662 (equirectangular)
    static project(lonlat) {
        return proj4("EPSG:4326", "EPSG:32662", lonlat);
    }

    static unproject(meters) {
        return proj4("EPSG:32662", "EPSG:4326", meters);
    }

    static getCorpus() {
        return corpus;
    }

    // static longToByteArray (/*long*/long) {
    //     // we want to represent the input as a 8-bytes array
    //     var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
    
    //     for ( var index = 0; index < byteArray.length; index ++ ) {
    //         var byte = long & 0xff;
    //         byteArray [ index ] = byte;
    //         long = (long - byte) / 256 ;
    //     }
    
    //     return byteArray;
    // };
    
    // static byteArrayToLong (/*byte[]*/byteArray) {
    //     var value = 0;
    //     for ( var i = byteArray.length - 1; i >= 0; i--) {
    //         value = (value * 256) + byteArray[i];
    //     }
    
    //     return value;
    // }

    static encrypt(number) {
        return number;
    }

    static decrypt(number) {
        return number;
    }

    static generateWords(lonlat) {

        var xy = OpenGeoWords.project(lonlat);
        var blockX = Math.round((xy[0] - projectionBounds[0]) / blockArea);
        var blockY = Math.round((xy[1] - projectionBounds[1]) / blockArea);

        var blockPosition = blockY * boundsX + blockX;
        blockPosition = OpenGeoWords.encrypt(blockPosition);

        var part1 = Math.floor(blockPosition / corpusSize);
        var part1r = blockPosition % corpusSize;

        var part2 = Math.floor(part1 / corpusSize);
        var part2r = part1 % corpusSize;

        var part3 = Math.floor(part2 / corpusSize);
        var part3r = part2 % corpusSize;

        var part4 = Math.floor(part3 / corpusSize);
        var part4r = part3 % corpusSize;

        if(part4r > 0) {
            console.log("remaining " , part4r)
        }

        return [corpus[part1r], corpus[part2r], corpus[part3r]];
    }

    static generateWordsString(lonlat) {
        var words = OpenGeoWords.generateWords(lonlat);

        return "///" + words[0] + "." + words[1] + "." + words[2]
    }

    static parseWordsString(text) {
        var text = text.replace(/\s/g,'');
        if(!text.startsWith("///")) {
            return null;
        }

        text = text.substring(3, text.length);
        var words = text.split(".");

        if(words.length != 3) {
            return null;
        }

        var part1r = corpusIndex[words[0]];
        var part2r = corpusIndex[words[1]];
        var part3r = corpusIndex[words[2]];

        if(!part1r || !part2r || !part3r) {
            return null;
        }

        var blockPosition = part3r * corpusSize * corpusSize + part2r * corpusSize + part1r;
        blockPosition = OpenGeoWords.encrypt(blockPosition);
        
        var blockY = Math.floor(blockPosition / boundsX);
        var blockX = blockPosition % boundsX;


        var meters = [
            blockX * blockArea + projectionBounds[0],
            blockY * blockArea + projectionBounds[1],
        ]

        var coordinates = OpenGeoWords.unproject(meters);

        return coordinates;
    }

    // reverseCalculateParts(20, 25000); // TODO test
    static reverseCalculateParts(blockArea = 3, corpusSize) {
        var maxBlocks = boundsX / blockArea * boundsY / blockArea

        var parts = 1;
        while(maxBlocks > corpusSize) {
            maxBlocks = Math.ceil(maxBlocks / corpusSize);
            parts++;
        }

        return {maxBlocks, parts};
    }

    // reverseCalculateCorpus(3, 3); // TODO test
    static reverseCalculateCorpus(blockArea = 20, parts = 3) {
        var maxBlocks = boundsX / blockArea * boundsY / blockArea

        var corpusSize = Math.pow(maxBlocks, 1 / parts);
        
        return {maxBlocks, corpusSize};
    }


}

// console.log(proj4("EPSG:4326", "EPSG:3857", [0, 0]));
// console.log(OpenGeoWords.reverseCalculateParts(3, corpusSize));
// console.log(OpenGeoWords.reverseCalculateCorpus(blockArea, 3));