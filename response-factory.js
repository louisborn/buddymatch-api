exports.OK = function (res, data) {
    return res.status(200).send({status: 200, message: '', rows: data});
}

exports.INTERNAL_ERROR = function (res) {
    return res.status(500).send({status: 500, message: 'Something went wrong', rows: []});
}