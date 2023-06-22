const repository = require('./repository');
const response = require('./response-factory');

/**
 * Authenticates a user via email and password
 * @param req
 * @param res
 * @returns {Promise<void>} 200 if authentication OK or 405 if not found or 401 if wrong credentials
 */
exports.login = async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const result = await repository.User.findOne({email: email});

        if (result) {

            if (result.password === password) {
                response.OK(res, 'User authentication success', []);
            } else {
                throw new Error();
            }
        } else {
            response.NOT_FOUND(res);
        }
    } catch (e) {
        response.UNAUTHORIZED(res);
    }
};

/**
 * Registers a new user
 * @param req
 * @param res
 * @returns {Promise<void>} 200 if registered else 500
 */
exports.register = async function (req, res) {
    const newUser = new repository.User({email: req.body.email, password: req.body.password, detail: {}});

    try {
        const existUserWithEmail = await repository.User.findOne({email: email});

        if (existUserWithEmail) {
            throw new Error();
        }

        const result = await newUser.save();

        if (result) {
            response.OK(res, 'User created', {_id: result._id});
        }
    } catch (e) {
        response.INTERNAL_ERROR(res);
    }

};

/**
 * Returns a list of users filtered by query parameters
 * e.g. '/:id/list?course=XYZ'
 * @param req
 * @param res
 * @returns {Promise<void>} foundUsers
 */
exports.list = async function (req, res) {
    try {
        let foundUsers = [];
        let query = {_id: {$ne: req.params.id}}

        for (const key in req.query) {
            query[key] = req.query[key];
            foundUsers = await repository.User.find(query);
        }

        if (foundUsers) {
            response.OK(res, '', foundUsers);
        } else {
            throw new Error();
        }
    } catch (e) {
        response.INTERNAL_ERROR(res);
    }
};

/**
 * Returns the requested user profile
 * @param req
 * @param res
 * @returns {Promise<void>} foundUser The users profile
 */
exports.profile = async function (req, res) {
    try {
        const foundUser = await repository.User.find({_id: req.params.id});

        if (foundUser) {
            response.OK(res, '', [foundUser]);
        } else {
            throw new Error();
        }
    } catch (e) {
        response.INTERNAL_ERROR(res);
    }
};