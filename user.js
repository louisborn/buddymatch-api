const repository = require('./repository');
const response = require('./response-factory');

exports.login = async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const result = await repository.User.findOne({email: email});

        if (result) {

            if (result.password === password) {
                response.OK('User authentication success');
            } else {
                throw new Error();
            }
        } else {
            res.status(405).send({status: 405, response: 'User not found'});
        }
    } catch (e) {
        res.status(401).send({status: 401, response: 'User authentication failed'});
    }
};

exports.register = async function (req, res) {
    const newUser = new repository.User({email: req.body.email, password: req.body.password, detail: {}});

    try {
        const existUserWithEmail = await repository.User.findOne({email: email});

        if (existUserWithEmail) {
            throw new Error();
        }

        const result = await newUser.save();

        if (result) {
            res.status(200).send({status: 200, response: 'User creation success', data: {_id: result._id}});
        }
    } catch (e) {
        res.status(500).send({status: 500, response: 'Something went wrong'});
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
            response.OK(foundUsers);
        } else {
            throw new Error();
        }
    } catch (e) {
        response.INTERNAL_ERROR();
    }
};

exports.profile = async function (req, res) {
    try {
        const foundUser = await repository.User.find({_id: req.params.id});

        if (foundUser) {
            res.status(200).json({status: 200, response: 'User detail success', data: foundUser});
        } else {
            throw new Error();
        }
    } catch (e) {
        res.status(500).send({status: 500, response: 'Something went wrong'});
    }
};