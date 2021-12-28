// TODO: Implement simple http listener for receiving data from parser
import express from 'express';

// import service
import checkAddress from '../services/addressChecker.js';
import automator from './automator.js';
import { checkRequired, checkErrorType } from '../utils/helpers.js';

// This is the router from express
const router = express.Router();

// Define POST method request
router.post('/', async (req, res)=>{
    const log = req.body;
    try {
        // Assume the body structure will be 
        // {"type": "", "from": "", "timestamp": ""}
        const errorType = log.type;
        const address = log.from;
        const timestamp = log.timestamp;

        // Check if the request body has missing requirement
        const required = checkRequired(errorType, address, timestamp);
        
        // Check if no required, so the request will be pass to the next process
        if(required.length == 0){
            // Call automator and pass the parameter

            // 1. hasil checknya, diterima atau tidak
            const checkStatus = await checkAddress(address)
            if (!checkStatus) {
                return res.status(400).send({
                    message: 'Address is not registered as a valid domain'
                });
            }
            
            // 2. Check if error type defined
            const checkError = checkErrorType(errorType)
            if (!checkError) {
                return res.status(400).send({
                    message: 'Error type is not defined'
                });
            }
            
            res.status(202).send({message:'Thanks! Your request is being process'});
            
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