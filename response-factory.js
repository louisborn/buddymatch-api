/**
 * Sends a successful response with status 200.
 * @param {Object} res - The response object.
 * @param {string} msg - The message to include in the response.
 * @param {any} data - The data to include in the response.
 * @returns {Object} - The response object.
 */
exports.OK = function (res, msg = '', data) {
    return res.status(200).send({status: 200, message: msg, rows: data});
}

/**
 * Sends an internal server error response with status 500.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object.
 */
exports.INTERNAL_ERROR = function (res) {
    return res.status(500).send({status: 500, message: 'Something went wrong', rows: []});
}

/**
 * Sends a "Not Found" response with status 405.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object.
 */

exports.NOT_FOUND = function (res) {
    return res.status(405).send({status: 405, message: 'Not found', rows: []})
}

/**
 * Sends an unauthorized response with status 401.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object.
 */
exports.UNAUTHORIZED = function (res) {
    return res.status(401).send({status: 401, message: 'Unauthorized', rows: []})
}

/**
 * Sends a response indicating missing parameter(s) with status 400.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object.
 */
exports.MISSING = function (res) {
    return res.status(400).send({status: 400, message: 'Missing param', rows: []})
}