// TODO: Implement Ansible logic
import util from 'util';
import { exec } from 'child_process';
import request from 'request';
import dotenv from 'dotenv';

import report from './report.js';
import { isAutoByErrorType } from '../utils/helpers.js';
import { escalation_dialog } from '../routers/notification_dialog.js';

dotenv.config()
const url = process.env.WEBHOOK_URL;
const SSH_KEY = process.env.SSH_KEY;
const asyncExec = util.promisify(exec);

async function generatePlaybookLink(ip, service, port, type, timestamp) {
    try {
        // send error report
        report(ip, service, port, type, timestamp,"error")

        // automate if error type is defined in '../utils/error_type'
        const auto = isAutoByErrorType(type)
        if (auto) {
            // It's not working! Help!!
            // const templateString = `
            //     ansible-playbook \
            //     -e device=${ip} \
            //     -e service=${service} \
            //     -e docker_port=${port} \
            //     -e type=docker \
            //     -e image=testapp \
            //     src/playbooks/restart-service.yml`;
            const templateString = `ssh -i ${SSH_KEY} ec2-user@${ip} docker restart ${service}`;
            let isHealth = false;
            let tried = 3;
            while (tried > 0 && !isHealth) {
                const { stdout, stderr } = await asyncExec(templateString);
                if (stdout) {
                    request.get(`http://${ip}:${port}/`, (error, res, body) => {
                        const status = res.statusCode || 500
                        if (status == 200) {
                            isHealth = true
                        }
                    });
                }
                if (stderr) {
                    // TODO: escalate 
                    // There is some error. RPA is not working. (default role: 1)
                    const location = `${ip}:${port}`;
                    const text_error = `*${type}* from service *${service}* at *${ip + (port ? ":" + port : "")}*.\n`+
                        `There is an error while running the RPA. Please look at me`;
                    escalation_dialog(text_error, location, 1)
                    console.error(stderr);
                    break;
                }
                tried -= 1;
            }
            // sendSuccess
            if (isHealth) {
                report(ip, service, port, type, timestamp,"success")
            }else{
                report(ip, service, port, type, timestamp,"failed").then(()=>{
                    // sendEscalation after failed (default role: 1)
                    const location = `${ip}:${port}`;
                    const text_failed = `[:fire:]Service *${service}* at *${ip}:${port}* still error after 3 times automatic restart\n${new Date()}.`;
                    escalation_dialog(text_failed,location,1)
                })
            }
        } else {
            // sendEscalation when error type is not for RPA (default role: 1)
            report(ip, service, port, type, timestamp,"escalate")
            const location = `${ip}:${port}`;
            const text_error = `*${type}* from service *${service}* at *${ip+(port?":"+port:"")}*`;
            escalation_dialog(text_error,location,1)
        }

    } catch (e) {
        const text_error = `\`I'm in error. Please fix me :(\``;
        escalation_dialog(text_error, `\`In the host\``, 1)
        console.error(e);
    }
}   

export default generatePlaybookLink