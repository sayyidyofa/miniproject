import express from 'express';

// initialize router
const router =  express.Router();

// import service
import addressCheker from '../services/addressChecker.js';
import automator from '../services/automator.js'

router.post('', automatePlaybook)

async function automatePlaybook (req, res) {
    let serviceType = req.body.type;
    let address = req.body.from;
    let timestamp = req.body.timestamp;

    // 1. hasil checknya, diterima atau tidak
    const checkStatus = await addressCheker.checkAddress(address)
    if(!checkStatus){
        return res.status(400).send({
            message: 'Address is not registered as a valid domain'
         });
    }

    // 2. jalankan automator untuk bikin script
    const generatedLink = await automator.generatePlaybookLink(address, serviceType)
    return res.send(generatedLink)

}

export default router