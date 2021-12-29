'use strict';
import { exec, spawn } from 'child_process';
import { writeFileSync } from 'fs';
import {cwd} from "process";

// Implement simple json file writer
function editImportantFile(isManual) {
    isManual
        ? writeFileSync('important_file', 'healthy=true\nmanual_config=invalid')
        : writeFileSync('important_file', 'healthy=false\nmanual_config=valid');
}

// Implement error trigger
export function errorTrigger() {
    editImportantFile(false);
}

export function errorTriggerManual() {
    editImportantFile(true);
}

// Implement error trigger scheduler (add)
export function addErrorTriggerScheduler() {
    exec(`(crontab -l ; echo "*/1 * * * * echo healthy=false > ${cwd()}/important_file") | crontab -`)
}

// Implement error trigger scheduler (remove)
export function removeErrorTriggerScheduler() {
    exec(`( crontab -l | grep -v -F "important_file" ) | crontab -`)
}
