// TODO: Implement simple http listener for receiving data from parser
import express from 'express';
// import automate from './automator.js';

// This is the router from express
const router = express.Router();

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
            res.send({message:'Thanks!'});
        }else{
            res.send({message:'The body is not meet the requirement'})
        }
    } catch (error) {
        console.log(error)
    }

});

export default router
