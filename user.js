const mongoose = require('mongoose');
const repository = require('./repository');
const response = require('./response-factory');
const jwt = require('jsonwebtoken');
const {isValidObjectId} = require('mongoose');
const {Match} = require('./repository');

function generateAccessToken(username) {
    return jwt.sign({username}, process.env.token, {expiresIn: '1800s'});
}

exports.authenticateToken = function (req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.token.toString(), (err, user) => {
        if (err) return res.sendStatus(403)

        req.user = user

        next()
    })
}

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
                const token = generateAccessToken(email);
                return response.OK(res, 'User authentication success', {
                    userId: result._id,
                    token
                });
            } else {
                throw new Error();
            }
        } else {
            return response.NOT_FOUND(res);
        }
    } catch (e) {
        return response.UNAUTHORIZED(res);
    }
};

/**
 * Registers a new user
 * @param req
 * @param res
 * @returns {Promise<void>} 200 if registered else 500
 */
exports.register = async function (req, res) {
    const newUser = new repository.User({email: req.body.email, password: req.body.password, detail: req.body.detail});

    try {
        const existUserWithEmail = await repository.User.findOne({email: req.body.email});

        if (existUserWithEmail) {
            throw new Error();
        }

        const result = await newUser.save();

        if (result) {
            return response.OK(res, 'User created', {_id: result._id});
        }
    } catch (e) {
        return response.INTERNAL_ERROR(res);
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
            return response.OK(res, 'Users found', foundUsers);
        } else {
            throw new Error();
        }
    } catch (e) {
        return response.INTERNAL_ERROR(res);
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
        const id = new mongoose.Types.ObjectId(req.params.id);
        const foundUser = await repository.User.findById(id);

        if (foundUser) {
            return response.OK(res, 'Profile data found', [foundUser]);
        } else {
            throw new Error();
        }
    } catch (e) {
        return response.INTERNAL_ERROR(res);
    }
};

exports.match = async function (req, res) {
    try {
        const sender = req.body.sender;
        const acceptor = req.body.acceptor;

        if (!sender || !acceptor) {
            return response.MISSING(res);
        }

        if (!isValidObjectId(sender) || !isValidObjectId(acceptor)) {
            return res.status(400).json({error: 'Ungültige Nutzer-IDs.'});
        }

        const existingMatch = await Match.findOne({
            $or: [
                {sender, acceptor},
                {sender: sender, acceptor: acceptor}
            ]
        });

        if (existingMatch) {
            return res.status(400).json({error: 'Die Nutzer sind bereits gematcht.'});
        }

        const match = new Match({
            sender,
            acceptor
        });

        await match.save();

        return response.OK(res, 'Match erstellt', []);
    } catch (error) {
        console.error('Fehler beim Erstellen des Matches:', error);
        return response.INTERNAL_ERROR(res);
    }
}

exports.matchesByUser = async function (req, res) {
    try {
        const existingMatches = await Match.find({sender: req.params.id});

        if (existingMatches) {
            return response.OK(res, 'Matches found', existingMatches);
        }
        throw new Error();
    } catch (e) {
        return response.INTERNAL_ERROR(res);
    }
}

exports.matchAccept = async function (req, res) {
    try {
        const filter = {sender: req.params.sender, acceptor: req.params.acceptor};
        const update = {accepted: true};
        const match = await Match.findOneAndUpdate(filter, update, {new: true});

        if (match) {
            return response.OK(res, 'Match updated', match);
        }
        throw new Error();
    } catch (e) {
        return response.INTERNAL_ERROR(res);
    }
}