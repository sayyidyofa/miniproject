import request from 'request';
import dotenv from 'dotenv';

dotenv.config()
const url = process.env.WEBHOOK_URL;
const CHANNEL_ID = process.env.channel_id

async function sendReport(message_text){
    try {
        const payload = JSON.stringify({
            channel: CHANNEL_ID,
            text : "RPA Reporting",
            attachments: [{
                blocks: [{
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: message_text
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

export { sendReport }