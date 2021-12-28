// Add utility/helper functions here
import { readFileSync } from 'fs';

export { checkRequired, checkErrorType }

function checkErrorType(errorType){
    const rawData = readFileSync('./src/utils/error_type');
    const errorList = rawData.toString().split('\n')

    const stringifiedAddress = String(errorType)
    if (errorList.includes(stringifiedAddress)){
        console.log(`'${stringifiedAddress}' is defined`)
        return true
    } else{
        console.log(`error type '${stringifiedAddress}' is not defined`)
        return false
    }
}

function checkRequired(serviceType, address, timestamp){
    const required = [];
    if (!serviceType) {
        required.push("type");
    }
    if (!address) {
        required.push("from");
    }
    if (!timestamp) {
        required.push("timestamp");
    }
    return required
} 