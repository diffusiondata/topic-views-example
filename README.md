# topic-views-example

An example Diffusion client that builds a topic tree of real foreign exchange prices, 
as refered to in the tutorial https://www.pushtechnology.com/blog/tutorial/topic-views

## Installation

> `npm install`

## Execution

Presuming your Diffusion server is available on `ws://localhost:8080` then run

> `npm start`

## Options

* `-h` host of Diffusion server, default: `localhost`
* `-p` port of Diffusion server, default: `8080`
* `-U` username/principal to authenticate session, default: `control`
* `-P` password/credentials to authenticate session, default: `password`
* `-t` topic path, under which to create topics, default `Demos/Fx`

For example `npm start -- -h somehost.example.com -p 8088`

## Licensing

This library is licensed under Apache License, Version 2.0.

Copyright (C) 2019 Push Technology Ltd