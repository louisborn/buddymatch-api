exports.OK = function (res, msg='', data) {
    return res.status(200).send({status: 200, message: msg, rows: data});
}

exports.INTERNAL_ERROR = function (res) {
    return res.status(500).send({status: 500, message: 'Something went wrong', rows: []});
}

exports.NOT_FOUND = function (res) {
    return res.status(405).send({status: 405, message: 'Not found', rows: []})
}

exports.UNAUTHORIZED = function (res) {
    return res.status(401).send({status: 401, message: 'Unauthorized', rows: []})
}

exports.MISSING = function (res) {
    return res.status(400).send({status: 400, message: 'Missing param', rows: []})
}