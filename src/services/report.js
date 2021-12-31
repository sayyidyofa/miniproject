import request from 'request';
import dotenv from 'dotenv';

import { escalation_dialog } from '../routers/notification_dialog.js';

dotenv.config()
const url = process.env.WEBHOOK_URL;
const CHANNEL_ID = process.env.channel_id

async function sendReport(ip, service, port, type, timestamp, status){
    try {
        // Custom text in here
        const text_success = `[:white_check_mark:]Service *${service}* at *${ip}:${port}* has been *successfully* restarted at ${new Date()}.`;
        const text_error = `*[:eyes:ERROR-${timestamp}]* ${type} from service *${service}* at *${ip+(port?":"+port:"")}*`;
        const text_failed = `[:fire:]Service *${service}* at *${ip}:${port}* still error after 3 times automatic restart\n${new Date()}.`;
        let text_send = "";

        // select text based on status value
        if (status === "error" || status === "escalate" ) {
            text_send = text_error
        }
        if (status === "success") {
            text_send = text_success
        }
        if (status === "failed") {
            text_send = text_failed
        }
        const payload = JSON.stringify({
            channel: CHANNEL_ID,
            text : "RPA Reporting",
            attachments: [{
                blocks: [{
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: text_send
                    },
                    block_id: "alert_error"
                }]
            }]
        });
        // this function called if the error cannot be solved by RPA (default role: 1)
        if (status === "escalate") {
            const location = `${ip}:${port}`;
            escalation_dialog(text_error,location,1)
            return 0
        }
        // send the report
        request.post({
            url,
            form: { payload }
        }, (error, res, body) => {
            // console.log(error, body, res.statusCode)
            // send offering for solving if RPA failed (default role: 1)
            if (status === "failed") {
                const location = `${ip}:${port}`;
                escalation_dialog(text_failed,location,1)
            }
        });
    } catch (error) {
        console.log(error)
    }
}

export default sendReport

