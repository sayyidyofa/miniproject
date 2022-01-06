// TODO: Implement Ansible logic
import util from 'util';
import { exec } from 'child_process';
import request from 'request';
import dotenv from 'dotenv';

import { sendReport } from './report.js';
import { isAutoByErrorType } from '../utils/helpers.js';
import { escalation_dialog } from '../routers/notification_dialog.js';

dotenv.config()
const default_role = 1
const asyncExec = util.promisify(exec);

async function generatePlaybookLink(ip, service, port, type, timestamp) {
    try {
        // send error report
        const text_error = `*[:eyes:ERROR-${timestamp}]* ${type} from service *${service}* at *${ip+(port?":"+port:"")}*`;
        sendReport(text_error);
        
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
            const templateString = `docker restart ${service}`;
            const { stdout, stderr } = await asyncExec(templateString);
            if (stdout) {
                // sendSuccess
                const text_success = `[:white_check_mark:]Service *${service}* at *${ip}:${port}* has been *successfully* restarted at ${new Date()}.`;
                sendReport(text_success);
            }
            if (stderr) {
                // There is some error. RPA is not working. (default role: 1)
                const location = `${ip}:${port}`;
                const text_error = `*${type}* from service *${service}* at *${ip + (port ? ":" + port : "")}*.\n`+
                    `There is an error while running the RPA. Please look at me`;
                escalation_dialog(text_error, location, default_role);
                console.error(stderr);
            }
        } else {
            // sendEscalation when error type is not for RPA (default role: 1)
            setTimeout(() => {
                // const text_failed = `[:fire:]Service *${service}* at *${ip}:${port}* still error after 3 times automatic restart\n${new Date()}.`;
                // sendReport(text_failed);
                const location = `${ip}:${port}`;
                const text_error = `*${type}* from service *${service}* at *${ip+(port?":"+port:"")}*`;
                escalation_dialog(text_error,location,default_role);
            }, 5000);
        }
    } catch (e) {
        const text_error = `\`I'm in error. Please fix me :(\``;
        escalation_dialog(text_error, `\`In the host\``, default_role);
        console.error(e);
    }
}

export default generatePlaybookLink
