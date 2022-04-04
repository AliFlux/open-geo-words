# Open Geo Words

**Convert coordinates into user-friendly four words**

Inspired by [what3words](https://what3words.com). This standalone js library converts coordinates into four words that are easier to read, write, and communicate with. Essentially, each 3m block in the whole world is mapped to a set of words. 

## Conversion example

```js
var lonlat  = [73.0479, 33.6844];
var result = OpenGeoWords.generateWordsString(lonlat)
///final.give.embedded.gulf
```

## Reverse convert example

```js
var words = "///final.give.embedded.gulf"
var result = OpenGeoWords.parseWordsString(lonlat)
// [73.0478, 33.6844]
```

Explore the [examples directory](/examples) for demos that you can run on your browser.

## Install via npm

```sh
npm install open-geo-words
```

And then in your browser code:

```js
import { OpenGeoWords } from "open-geo-words";
```

Or in your Node.js code:

```js
var { OpenGeoWords } = require("open-geo-words");
```

## Install via `<script>` tag from CDN

```html
<script src="https://unpkg.com/open-geo-words@1.0.3/dist/open-geo-words.js"></script>
```

And then in your code:

```js
var OpenGeoWords = new window["open-geo-words"].OpenGeoWords;
```

## Purpose

What3words is pretty amazing, but it only works as an online API. In GIS and mapping domain, there is an increasing demand for offline systems so I decided to write this tiny script in a couple of hours to provide an alternative.

## Limitations

Currently a four words string is generated instead of three. That is because the [words list](src/corpus.js) I am using only has about 8000 words. I am looking for a list of about 60k words to properly map the world in three words. The list must only contain most frequent words in simple english, without any profanity and complications. If you find such a list, please let me know.

## Stay in touch

For latest releases and announcements, check out my site: [aliashraf.net](http://aliashraf.net)

## License

This software is released under the [MIT License](LICENSE). Please read LICENSE for information on the
software availability and distribution.

Copyright (c) 2022 [Ali Ashraf](http://aliashraf.net)