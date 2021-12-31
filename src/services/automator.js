// TODO: Implement Ansible logic
import util from 'util';
import { exec } from 'child_process';
import request from 'request';
import dotenv from 'dotenv';
import { isAutoByErrorType } from '../utils/helpers.js';
import report from './report.js';

dotenv.config()
const url = process.env.WEBHOOK_URL;
const SSH_KEY = process.env.SSH_KEY;
const asyncExec = util.promisify(exec);

async function generatePlaybookLink(ip, service, port, type, timestamp) {
    try {
        // send error report
        report(ip, service, port, type, timestamp,"error")

        // automate if error type is defined in '../utils/error_type'
        const auto = await isAutoByErrorType(type)
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
                        const status = res.statusCode
                        if (status == 200) {
                            isHealth = true
                        }
                    });
                }
                if (stderr) {
                    // TODO: escalate 
                    report(ip, service, port, type, timestamp,"failed")
                    console.error(stderr);
                    break;
                }
                tried -= 1;
            }
            // sendSuccess
            if (isHealth) {
                report(ip, service, port, type, timestamp,"success")
            }else{
                // sendEscalation
                report(ip, service, port, type, timestamp,"failed")
            }
        } else {
            report(ip, service, port, type, timestamp,"escalate")
        }

    } catch (e) {
        console.error(e);
    }
}   

export default generatePlaybookLink