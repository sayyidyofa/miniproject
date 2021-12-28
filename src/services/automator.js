// TODO: Implement Ansible logic
// TODO: Implement Notifier
import {exec} from 'child_process';
import { stdout, stderr } from 'process';

function generatePlaybookLink(address,service){
    const templateString = `ansible-playbook -e device=${address} -e service=${service} ../playbooks/restart-service.yml`
    exec(templateString, (error, stdout, stderr) => {
        if(error){
            console.error(`error: ${error.message}`);
        }
        if (stderr){
            console.error(`stderr: ${stderr}`);
        }
        console.log(`stdout:\n${stdout}`);
    })
    return templateString
}   

export default generatePlaybookLink