![Logo](logo.png)

# Fatina
Small & Light tweening library for **Games** / **Web**

* **Website**: [Here](https://kefniark.github.io/Fatina/)
* **API**: [Here](https://kefniark.github.io/Fatina/api/basic/)
* **Samples**: [Here](https://kefniark.github.io/Fatina/samples/generic/)

[![NPM Version](https://img.shields.io/npm/v/fatina.svg)](https://npmjs.org/package/fatina)
[![NPM Downloads](https://img.shields.io/npm/dm/fatina.svg)](https://npmjs.org/package/fatina)
[![Build Status](https://img.shields.io/travis/kefniark/Fatina/master.svg)](https://travis-ci.org/kefniark/Fatina)
[![Coverage Status](https://coveralls.io/repos/github/kefniark/Fatina/badge.svg?branch=master)](https://coveralls.io/github/kefniark/Fatina?branch=develop)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f0451df42a9d43fa810f32f20005f9aa)](https://www.codacy.com/app/kefniark/Fatina?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=kefniark/Fatina&amp;utm_campaign=Badge_Grade)
[![License](https://img.shields.io/npm/l/fatina.svg)](https://npmjs.org/package/fatina)

## Description
A comprehensive and easy to use animation library for **Typescript** / **Javascript**

* Easy to use (API strongly inspired by Dotween)
* Lightweight with no dependencies ( < 20KB )
* Unit tested + code coverage
* Open source and MIT License (use it as you please)

## Getting Started

### Install
If you use directly the minified version
```ts
<script src="fatina.min.js"></script>
```
Or if you use NPM
```ts
> npm install fatina
```
And load it with
```ts
// standard node.js require
var Fatina = require('fatina');
// OR
// standard import with typescript (typed version)
import * as Fatina from 'fatina';
```
* [More Information](https://kefniark.github.io/Fatina/basics/download/)

### Usage
```ts
Fatina.Tween(obj, properties).To(destination, duration).Start();
```
* [Documentation](https://kefniark.github.io/Fatina/api/basic/)
* [Samples](https://kefniark.github.io/Fatina/samples/generic/)
