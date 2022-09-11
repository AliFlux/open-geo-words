# Open Geo Words

**Convert coordinates into user-friendly three words**

Inspired by [what3words](https://what3words.com). This standalone js library converts coordinates into three words that are easier to read, write, and communicate with. Essentially, each 3m block in the whole world is mapped to a set of words. 

## Conversion example

```js
var lonlat  = [73.1132, 33.5321];
var result = OpenGeoWords.generateWordsString(lonlat)
///blower.endurance.napier
```

## Reverse convert example

```js
var words = "///blower.endurance.napier"
var result = OpenGeoWords.parseWordsString(lonlat)
// [73.1132, 33.5321]
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
<script src="https://unpkg.com/open-geo-words@1.0.6/dist/open-geo-words.js"></script>
```

And then in your code:

```js
var OpenGeoWords = new window["open-geo-words"].OpenGeoWords;
```

## Purpose

What3words is pretty amazing, but it only works as an online API. In GIS and mapping domain, there is an increasing demand for offline systems so I decided to write this tiny script in a couple of hours to provide an alternative.

## Stay in touch

For latest releases and announcements, check out my site: [aliashraf.me](http://aliashraf.me)

## License

This software is released under the [MIT License](LICENSE). Please read LICENSE for information on the
software availability and distribution.

Copyright (c) 2022 [Ali Ashraf](http://aliashraf.me)