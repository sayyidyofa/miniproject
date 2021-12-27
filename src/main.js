// TODO: Implement I/O pipeline

import express from 'express';
import listener from './services/listener.js';
import dotenv from 'dotenv';
import pipelineAutomator from './routers/pipeline_router'

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/log', listener)
app.use('/pipeline',pipelineAutomator)

// Run the server
app.listen(PORT, () => {
    console.log(`Server running on port : ${PORT}`);
})