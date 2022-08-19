const Register = require('../models/register');

const apiAuth = async (req, res, next) => {
    const userId = req.header('user-token');
    if (!userId) {
        return res.status(401).send({ error: 'Please Authenticate with valid token' });
    }
    try {
        const user = await Register.findById(userId)
        if (!user) {
            return res.status(401).send({ error: 'Please Authenticate with valid token' });
        }
        const apiKey = req.query.key;
        if (apiKey === process.env.API_KEY) {
            next();
        } else {
            return res.status(401).json({ Error: "Unauthorized" })
        }
    } catch (e) {
        return res.status(401).json({ Error: "Unauthorized" })
    }
}

module.exports = apiAuth;