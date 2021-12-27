'use strict';
import { exec, spawn } from 'child_process';
import { writeFileSync } from 'fs';
import {cwd} from "process";

// Implement simple json file writer
function editImportantFile(key, value) {
    writeFileSync('important_file', `${key}=${value}`);
}

// Implement error trigger
export function errorTrigger() {
    editImportantFile('healthy', false);
}

// Implement error trigger scheduler (add)
export function addErrorTriggerScheduler() {
    exec(`(crontab -l ; echo "*/1 * * * * echo healthy=false > ${cwd()}/important_file") | crontab -`)
}

// Implement error trigger scheduler (remove)
export function removeErrorTriggerScheduler() {
    exec(`( crontab -l | grep -v -F "important_file" ) | crontab -`)
}
