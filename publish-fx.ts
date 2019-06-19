#!/usr/bin/env ts-node
import request from 'request';
import commandLineArgs from 'command-line-args';
import * as diffusion from 'diffusion';

const truefxURL = 'http://webrates.truefx.com/rates/connect.html';
const pollFreq = 1000;

const optionDefinitions = [
    { name: 'host', alias: 'h', type: String, defaultValue: 'localhost'},
    { name: 'port', alias: 'p', type: Number, defaultValue: 8080},
    { name: 'username', alias: 'U', type: String, defaultValue: 'control'},
    { name: 'password', alias: 'P', type: String, defaultValue: 'password'},
    { name: 'topic', alias: 't', type: String, defaultValue: 'Demos/Fx'}
  ];

const options = commandLineArgs(optionDefinitions);
const spec = new diffusion.topics.TopicSpecification(diffusion.topics.TopicType.JSON, {
    COMPRESSION: 'false'
});

function placeTrueFxRequest(session: diffusion.Session, topicRoot: string) {
	request({
		url: truefxURL,
		method: "GET",
		qs: {f: 'csv'}
		}, (error, response, body) => {
		    if (!error && response.statusCode == 200) {
                const topicValues: any[] = processCurrencyPairs(body);

                const promises = topicValues.map((topicValue, i) =>
                    session.topicUpdate.set(
                        topicRoot + '/raw/' + i,
                        diffusion.datatypes.json(),
                        topicValue,
                        {specification: spec})
                );
                Promise.all(promises).then(() => {
                    console.log(`Updated ${promises.length} topics under ${topicRoot}/raw`);
                }).catch((error) => console.error);
            } else {
		    	console.error(`Unexpected response from ${truefxURL}, statusCode: ${response.statusCode}`);
		    }
		}
	);
}

function processCurrencyPairs(csvData: string): any[] {
	const lines = csvData.trim().split("\n");

    return lines.map((line) => {
        const [pairName, millis,
            bidBig, bidPoints,
            offerBig, offerPoints,
            high, low, open] = line.split(",");

		return {
			pairName: pairName.replace('\/', '⁄'), // Unicode trickery
			timestamp: millis,
			bid: {big: bidBig, points: bidPoints},
			offer: {big: offerBig, points: offerPoints},
			high: high,
			low: low,
			open: open
		}
    });
}

diffusion.connect({
    host : options.host,
    port: options.port,
    principal : options.username,
    credentials : options.password
}).then((session) => {
    console.log(`Connected to ${options.host}:${options.port}`);
    setInterval(() => placeTrueFxRequest(session, options.topic), pollFreq);
}, (error) => {
    console.error(`Cannot connect to Diffusion: ${error}`);
});
