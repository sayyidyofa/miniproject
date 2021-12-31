// TODO: Implement I/O pipeline

import express from 'express';
import listener from './services/listener.js';
import dotenv from 'dotenv';
import pipelineAutomator from './routers/pipeline_router.js';
import dockerState from './routers/docker-state.js';
import {notificationRouter} from './routers/notification_dialog.js';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/log', listener)
app.use('/pipeline', pipelineAutomator)
app.use('/docker-state', dockerState)


// Run the server
app.listen(PORT, () => {
    console.log(`Server running on port : ${PORT}`);
})