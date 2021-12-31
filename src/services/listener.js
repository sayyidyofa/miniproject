// TODO: Implement simple http listener for receiving data from parser
import express from 'express';
import dotenv from 'dotenv';

// import service
import automator from './automator.js';
import { checkRequired, ipAddressChecker } from '../utils/helpers.js';

dotenv.config();
const router = express.Router();
const url = process.env.WEBHOOK_URL;

// Define POST method request
router.post('/', async (req, res)=>{
    const log = req.body;
    try {
        // Assume the body structure will be 
        // {"type": "", "service":"", "from": "0.0.0.0:9999", "timestamp": ""}
        // Check if the request body has missing requirement
        const required = checkRequired(log);

        // Check if no required, so the request will be pass to the next process
        if(required.length == 0){
            const type = log.type;
            const service = log.service;
            const ip = log.from.split(':')[0];
            const port = log.from.split(':')[1];
            const timestamp = log.timestamp;

            // Call automator and pass the parameter
            // 1. Check if the address is known
            const checkStatus = ipAddressChecker(ip);
            if (!checkStatus) {
                return res.status(404).send({
                    message: 'Address is not registered as a valid domain'
                });
            }
              
            res.status(202).send({message:'Thanks! Your request is being process'});
            
            automator(ip, service, port, type, timestamp);
            // automate if error type is defined in '../utils/error_type'
            // const auto = isAutoByErrorType(type)
            // if (auto) {
            //     await automator(ip, service, port, type);
            // } else {
            //     // call escalation
            // }
        }else{
            res.status(400).send({message:`[${required}] is required.`})
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({message:'Internal Server Error'})
    }

});

export default router