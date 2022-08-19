const mongoose = require('mongoose')
mongoose.connect(`mongodb://localhost:27017/${process.env.COLLECTION}`).then(() => {
    console.log('connected to Db');
}).catch((e) => {
    console.log('Error! Connection Failed to Db');
})