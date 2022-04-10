var assert = require('assert');
var { OpenGeoWords } = require("../dist/open-geo-words");

describe('OpenGeoWords', function () {

	describe('generateWords()', function () {
		it('should return oaths.bogging.playful when the coordinates are [73.1132, 33.5321]', function () {
			assert.equal(OpenGeoWords.generateWordsString([73.1132, 33.5321]), "///oaths.bogging.playful");
		});
	});
	
	describe('parseWordsString()', function () {
		it('should return [73.11319825487192, 33.53209732994531] when the words are oaths.bogging.playful', function () {
			assert.deepEqual(OpenGeoWords.parseWordsString("///oaths.bogging.playful"), [73.11319825487192, 33.53209732994531]);
		});
	});

});