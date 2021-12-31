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
        if (status === "error" ) {
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
        // send the report
        request.post({
            url,
            form: { payload }
        }, (error, res, body) => {
            // console.log(error, body, res.statusCode)
        });
        return 1
    } catch (error) {
        console.log(error)
    }
}

export default sendReport

