import { OpenGeoWords } from "../../src";


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

map.on('pointermove', function (evt) {
    var lonlat  = ol.proj.toLonLat(evt.coordinate);
    var text = OpenGeoWords.generateWordsString(lonlat)

    // we get accuracy by reversing the process and finding distance to original coords
    var lonlat2 = OpenGeoWords.parseWordsString(text);
    var distance = haversineDistance(lonlat, lonlat2);

    var infoBox = document.getElementById("info");

    infoBox.innerText = text + "\n" + distance.toFixed(2) + "m accuracy"
});

console.log(OpenGeoWords.generateWordsString([73.0479, 33.6844]));
console.log(OpenGeoWords.parseWordsString("///final.give.embedded.gulf"));