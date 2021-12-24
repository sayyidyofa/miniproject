// TODO: Implement simple http listener for receiving data from parser
import express from 'express';
// Uncomment code below if the function ready
// import automate from './automator';

const app = express();
app.use(express.json());

// This is PORT listener
const PORT = process.env.PORT || 3000;

// Define POST method request
app.post('/log', (req, res)=>{
    const log = req.body;
    try {

        // Assume the body structure will be 
        // {"type": "", "from": "", "timestamp": ""}
        const type: string = log.type;
        const from: string = log.from;
        const timestamp: string = log.timestamp;
        
        // Check if the body from request has the data
        if(type && from && timestamp){

            // Call automator and pass the parameter

            // Uncomment code below if the function ready
            // automate(type, from, timestamp);
            res.send('Thanks!');
        }else{
            res.send('The body is not meet the requirement')
        }
    } catch (error) {
        console.log(error)
    }

});

// Run the server
app.listen(PORT, ()=>{
    console.log(`Server running on port : ${PORT}`);
  })

export default app