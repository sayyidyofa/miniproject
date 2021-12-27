// TODO: Implement I/O pipeline

import express from 'express';
import listener from './services/listener.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/log', listener)

// Run the server
app.listen(PORT, () => {
    console.log(`Server running on port : ${PORT}`);
})