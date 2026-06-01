// const { response } = require("express");

module.exports = {
    response : (status, message, data) => {
        if (data) {
            //jika response menghasilkan data
            return {
                status: status,
                message: message,
                data: data
            }
        } else {
            //jika response tidak menghasilkan data misalnya error validasi, delete data
            return {
                status : status,
                message: message
            }
        }
    }
}