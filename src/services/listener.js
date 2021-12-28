// TODO: Implement simple http listener for receiving data from parser
import express from 'express';
// import automate from './automator.js';

// This is the router from express
const router = express.Router();
const url = process.env.WEBHOOK_URL;

// Define POST method request
router.post('/', (req, res)=>{
    const log = req.body;
    try {
        // Assume the body structure will be 
        // {"type": "", "from": "", "timestamp": ""}
        const type = log.type;
        const from = log.from;
        const timestamp = log.timestamp;
        
        // Check if the body from request has data that we need 
        if(type && from && timestamp){
            // Call automator and pass the parameter
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
            res.status(202).send({message:'Thanks! Your request is being process'});

            request.post({
                headers : { 'Content-type' : 'application/json' },
                url,
                form : {payload: JSON.stringify(payload_block)}
            },(error, res, body) => console.log(error, body, res.statusCode));
        }else{
            const required = [];
            if (!type) {
                required.push("type");
            }
            if (!from) {
                required.push("from");
            }
            if (!timestamp) {
                required.push("timestamp");
            }
            res.status(400).send({message:`[${required}] is required.`})
        }
    } catch (error) {
        res.status(500).send({message:'Internal Server Error'})
    }

});

export default router
