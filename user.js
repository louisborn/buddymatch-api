const mongoose = require('mongoose');
const repository = require('./repository');
const response = require('./response-factory');
const jwt = require('jsonwebtoken');
const {isValidObjectId} = require('mongoose');
const {Match, Chat} = require('./repository');

/**
 * Converts a string ID to a Mongoose ObjectId.
 * @param {string} id - The string ID to convert.
 * @returns {mongoose.Types.ObjectId} - The converted ObjectId.
 */
function toObjectId(id) {
    return new mongoose.Types.ObjectId(id);
}

function generateAccessToken(username) {
    return jwt.sign({username}, process.env.token, {expiresIn: '1800s'});
}

/**
 * Middleware function to authenticate a token in the request header.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
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
 * Authenticates a user via email and password.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Resolves with the HTTP response.
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
 * Registers a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Resolves with the HTTP response.
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

exports.updateUser = async function (req, res) {
    const id = toObjectId(req.body.userId);
    const detail = req.body.detail;

    try {
        const existUser = await repository.User.findById(id);

        if (existUser) {
            const updatedUser = await repository.User.findByIdAndUpdate(
                id,
                { detail },
                { new: true }
            );

            if (updatedUser) {
                return response.OK(res, 'User created', { user: updatedUser });
            }
        }
        else {
            throw new Error();
        }
    } catch (e) {
        return response.INTERNAL_ERROR(res);
    }
};

/**
 * Returns a list of users filtered by query parameters.
 * Filter study programs: ?study_program=Program1,Program2
 * Filter attended courses: ?attended_courses=CourseName1,CourseName2
 * Filter skills: ?skills=Skill1,Skill2
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Resolves with the HTTP response.
 */
exports.list = async function (req, res) {
    try {
        let foundUsers = [];
        const id = new mongoose.Types.ObjectId(req.params.id);
        let query = {_id: {$ne: id}};

        const filtersList = [];

        for(const param in req.query) {
            const key = `detail.${param}`;
            const filter = {};
            filter[key] = {
                '$in': req.query[param].split(',')
            };
            filtersList.push(filter);
        }

        if(filtersList.length > 0) {
            query = {
                ...query,
                '$or': filtersList
            }
        }
        
        foundUsers = await repository.User.find(query);

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
 * Returns the requested user profile.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Resolves with the HTTP response.
 */
exports.profile = async function (req, res) {
    try {
        const id = toObjectId(req.params.id);
        const foundUser = await repository.User.findById(id);

        if (foundUser) {
            return response.OK(res, 'Profile data found', {user: foundUser});
        } else {
            throw new Error();
        }
    } catch (e) {
        return response.INTERNAL_ERROR(res);
    }
};

/**
 * Creates a new match between two users.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Resolves with the HTTP response.
 */
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

/**
 * Returns a list of matches by the sender's ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Resolves with the HTTP response.
 */
exports.matchesBySender = async function (req, res) {
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

/**
 * Returns a list of matches by the acceptor's ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Resolves with the HTTP response.
 */
exports.matchesByAcceptor = async function (req, res) {
    try {
        const existingMatches = await Match.find({acceptor: req.params.id});

        if (existingMatches) {
            return response.OK(res, 'Matches found', existingMatches);
        }
        throw new Error();
    } catch (e) {
        return response.INTERNAL_ERROR(res);
    }
}

/**
 * Accepts a pending match and creates a new chat instance.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Resolves with the HTTP response.
 */
exports.matchAccept = async function (req, res) {
    try {
        const filter = {sender: req.params.sender, acceptor: req.params.acceptor};
        const update = {accepted: true};
        const match = await Match.findOneAndUpdate(filter, update, {new: true});

        if (match) {
            const participants = [toObjectId(req.params.sender), toObjectId(req.params.acceptor)];
            const newChat = new repository.Chat({participants: participants});
            const result = await newChat.save();

            if (result) {
                return response.OK(res, 'Chat created', {chat_id: result._id});
            }
        }
        throw new Error();
    } catch (e) {
        return response.INTERNAL_ERROR(res);
    }
}

/**
 * Returns a list of chats where the user with the provided ID is a participant.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Resolves with the HTTP response.
 */
exports.listChats = async function (req, res) {
    try {
        const existingChats = await Chat.find({participants: req.params.id});

        if (existingChats) {
            return response.OK(res, 'Matches found', existingChats);
        }
        throw new Error();
    } catch (e) {
        return response.INTERNAL_ERROR(res);
    }
}

/**
 * Updates a chat by adding a new message.
 * @param {mongoose.Types.ObjectId} to - The ID of the chat to update.
 * @param {mongoose.Types.ObjectId} senderId - The ID of the message sender.
 * @param {string} content - The content of the message.
 * @returns {Promise<repository.Chat>} - Resolves with the updated chat.
 */
exports.updateChat = async function (to, senderId, content) {
    return Chat.findByIdAndUpdate(
        to,
        {
            $push: {
                messages: {
                    sender: senderId,
                    content: content
                }
            }
        },
        {new: true}
    );
}