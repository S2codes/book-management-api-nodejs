require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path')
const PORT = 8000 || process.env.PORT;
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
require('./server/db');
// paths 
const static_path = path.join(__dirname, '/public')
const template_path = path.join(__dirname, './templates/views')
const partials_path = path.join(__dirname, './templates/partials')


app.use(express.urlencoded({extended: false}))
app.use(express.json());
app.use(express.static(static_path))
app.use(cookieParser())
// set views engine : hbs 
app.set('view engine', 'hbs');
app.set('views', template_path);
// partials 
hbs.registerPartials(partials_path)

// routes 
const apiRoutes = require('./routes/apiRoute');
const routes = require('./routes/routes');
app.use('/', routes)
app.use('/api', apiRoutes)


app.listen(PORT, () => {
    console.log('Listing at port : ', PORT);
})

