// TODO: Implement simple http listener for receiving data from parser
import express from 'express';

// import service
import checkAddress from '../services/addressChecker.js';
import automator from './automator.js';
import { checkRequired, checkErrorType } from '../utils/helpers.js';

// This is the router from express
const router = express.Router();
const url = process.env.WEBHOOK_URL;

// Define POST method request
router.post('/', async (req, res)=>{
    const log = req.body;
    try {
        // Assume the body structure will be 
        // {"type": "", "from": "", "timestamp": ""}
        const type = log.type;
        const from = log.from;
        const timestamp = log.timestamp;

        // Check if the request body has missing requirement
        const required = checkRequired(type, from, timestamp);
        
        // Check if no required, so the request will be pass to the next process
        if(required.length == 0){
            // Call automator and pass the parameter

            // 1. Check if the address is listing
            const checkStatus = await checkAddress(from)
            if (!checkStatus) {
                return res.status(400).send({
                    message: 'Address is not registered as a valid domain'
                });
              
            // 2. Check if error type defined
            const checkError = checkErrorType(type)
            if (!checkError) {
                return res.status(400).send({
                    message: 'Error type is not defined'
                });
            }
              
            res.status(202).send({message:'Thanks! Your request is being process'});
              
            // automate(type, from, timestamp);
            const payload_block = {
                "text" : "RPA Reporting",
                "attachments": [{
                    "blocks": [{
                        "type": "section",
                        "text": {
                                    "type": "mrkdwn",
                                    "text": `[ERROR-${timestamp}] ${type} from service/IP ${from} `
                                },
                        "block_id": "alert_error"
                    }]
                }
            ]};

            request.post({
                headers : { 'Content-type' : 'application/json' },
                url,
                form : {payload: JSON.stringify(payload_block)}
            },(error, res, body) => console.log(error, body, res.statusCode));
            
            // 3. jalankan automator untuk bikin script
            const generatedLink = automator(address, errorType)
        }else{
            res.status(400).send({message:`[${required}] is required.`})
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({message:'Internal Server Error'})
    }

});

export default router