'use strict';
import express from 'express';
import {readFileSync, writeFileSync} from 'fs';
import { request } from 'http';
import {addErrorTriggerScheduler, errorTrigger, removeErrorTriggerScheduler} from "./mischiefs.js";

// Implement simple file reader
// Returns boolean
// Reads an important file that contains very critical information that if its invalid,
//   the app crashes, sending 500 status code to every request
function readImportantFile() {
    let rawData = readFileSync('important_file');
    const keyword = 'healthy';
    return rawData
        .toString()
        .split('\n')
        .map(el => el.split('='))
        .find(el => el[0] === keyword)
        [1]
}

// Implement important_file default setter
// Replace the value in important file to default: healthy=true
function resetImportantFile() {
    writeFileSync('important_file', 'healthy=true');
}

// Implement simple error reporter
// Simplified the process from error log parsing to reporting
// For simplicity's sake of the demonstration, instead of dumping logs and reading it to parse and send,
//   this function cuts the process to only just report a valid json to the backend
function reportErrorToBackend() {
    const data = new TextEncoder().encode(
        JSON.stringify({
            type: "test",
            from: "127.0.0.1",
            timestamp: "now"
        })
    )
    const req = request({
        hostname: 'localhost',
        port: 3000,
        path: '/log',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }, res => {
        console.log(`statusCode: ${res.statusCode}`)
        res.on('data', d => {
            process.stdout.write(d)
        })
    });
    req.on('error', error => {
        console.error(error)
    })
    req.write(data)
    req.end()
}

// Implement simple http service with express
// Simulating interaction with other service/user/3rd party
// When error happens, it will send 500 status code
//
// How does it "fail"?
// For every request, it reads a file (via),
//   suppose it contains very critical information that if its invalid,
//   the app crashes, sending 500 status code to every request
//   and reports the error to the actual backend
const httpService = express();
const port = 4444;

const body =
    `<div>Hello there. I am working and healthy :)</div>
<br><button onclick="let r = new XMLHttpRequest(); r.open('GET', 'http://localhost:4444/break', false); r.send(null);location.reload()">Break me</button>
&nbsp <button onclick="let r = new XMLHttpRequest(); r.open('GET', 'http://localhost:4444/addcron', false); r.send(null);location.reload()">Add cronjob</button> 
&nbsp <button onclick="let r = new XMLHttpRequest(); r.open('GET', 'http://localhost:4444/removecron', false); r.send(null);location.reload()">Remove cronjob</button>`;

httpService.get('/', (req, res) => {
    // main logic
    const isAppHealthy = readImportantFile();
    if (isAppHealthy === "true") {
        res.send(body);
    } else {
        reportErrorToBackend();
        res.status(500).send("Internal server error. I am not healthy :(");
    }
});

// Failure endpoint. Fire a request here to break the app
httpService.get('/break', (req, res) => {
    errorTrigger();
    res.send('success');
});

// Add failure cronjob endpoint. Fire a request here to add cronjob that sets healthy to false every minute
httpService.get('/addcron', (req, res) => {
    addErrorTriggerScheduler();
    res.send('success');
});

// Remove failure cronjob endpoint. Fire a request here to remove the cronjob
httpService.get('/removecron', (req, res) => {
    removeErrorTriggerScheduler();
    res.send('success');
});

// Reset the important file before running
resetImportantFile();

// Run the simple http service a.k.a. testApp
httpService.listen(port, () => {
    console.log(`Test app listening at port: ${port}`);
});
