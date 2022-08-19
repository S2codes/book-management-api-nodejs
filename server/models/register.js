const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userShema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }],
    date: {
        type: Date,
        default: Date.now 
    },
})

// generate token 
userShema.methods.generateAuthToken = async function () {
    try {
        const newToken = jwt.sign({_id: this.id.toString()}, process.env.JWT_SECRET)
        this.tokens = this.tokens.concat({token: newToken});
        await this.save();
        return newToken;
    } catch (e) {
        console.log('error in token', e);
    }
}

const Register = new mongoose.model('User', userShema);
module.exports = Register;