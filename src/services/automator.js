// TODO: Implement Ansible logic
import { exec } from 'child_process';

// perlu implemen exec dalam bentuk async await
function generatePlaybookLink(address, service){
    const templateString = `
        ansible-playbook
        -e device=${address}
        -e service=${service}
        -e type=docker
        -e image=nginx
        src/playbooks/restart-service.yml`;
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