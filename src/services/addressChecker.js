// dummy list ip
// perlu check langsung ke file inventory terus diubah jadi "daftarIP" dalam bentuk array
const daftarIP = ['127', '128', '129', '13.229.90.181']

function checkAddress(address){

    const stringifiedAddress = String(address)
    if (daftarIP.includes(stringifiedAddress)){
        console.log('ada, ip nya adalah', stringifiedAddress)
        return true
    } else{
        console.log('gaada, ip nya adalah', stringifiedAddress)
        return false
    }
} 

export default checkAddress