// TODO: Implement Ansible logic
import util from 'util';
import { exec } from 'child_process';
import request from 'request';

import dotenv from 'dotenv';
dotenv.config()
const url = process.env.WEBHOOK_URL;

const asyncExec = util.promisify(exec);

async function generatePlaybookLink(ip, service, port) {
    try {
        // It's not working! Help!!
        // const templateString = `
        //     ansible-playbook \
        //     -e device=${ip} \
        //     -e service=${service} \
        //     -e docker_port=${port} \
        //     -e type=docker \
        //     -e image=testapp \
        //     src/playbooks/restart-service.yml`;
        const templateString = `ssh -i ~/.ssh/ec2v2.pem ec2-user@${ip} docker restart ${service}`;
        const { stdout, stderr } = await asyncExec(templateString);

        if (stderr) {
            // TODO: escalate problem
            console.error(stderr);
        }
        const payload = JSON.stringify({
            channel: 'C02S28LEWRJ',
            text : "RPA Reporting",
            attachments: [{
                blocks: [{
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `service ${service} at ${ip}:${port} has been successfully restarted at ${new Date()}.`
                    },
                    block_id: "alert_error"
                }]
            }]
        });

        console.log(stdout);
        if (stdout) {
            request.post({
                url,
                form: { payload }
            }, (error, res, body) => {
                console.log(error, body, res.statusCode)
            });
        }
        return stdout;
    } catch (e) {
        console.error(e);
    }
}   

export default generatePlaybookLink