// TODO: Implement Ansible logic
// TODO: Implement Notifier
const {exec} = require('child_process');
const { stdout, stderr } = require('process');

module.exports = {
    generatePlaybookLink
}



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