const express = require('express');
const router = express.Router();
const Register = require('../server/models/register');
const bcrypt = require('bcryptjs');
const auth = require('../server/middlewares/auth');
const Books = require('../server/models/Books');
const { body, validationResult } = require('express-validator');

router.get('/login', (req, res) => {
    res.render('login')
})
router.get('/signup', (req, res) => {
    res.render('signup')
})
router.get('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = []
        res.clearCookie('jwt')
        await req.user.save()
        res.redirect('/signup')

    } catch (e) {
        console.log('logout error', e);
    }
})
// signup post 
router.post('/signup', [
    body('name', 'Enter a Valid Name').isLength({ min: 3 }),
    body('email', 'Enter a Valid Email').isEmail(),
    body('password', 'Password Must be atleast 5 Charecters').isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = errors.array();
        return res.status(400).render('signup', {
            errorMsg: err[0].msg
        })

    }
    try {
        let isUser = await Register.findOne({ email: req.body.email })
        if (isUser) {
            return res.status(400).render('signup', {
                errorMsg: "Enter the Details Properly"
            })
        }
        if (req.body.passw === req.body.cpassw) {
            const salt = await bcrypt.genSalt(10);
            const hashPassw = await bcrypt.hash(req.body.passw, salt);
            const User = new Register({
                name: req.body.name,
                email: req.body.email,
                password: hashPassw
            })

            const token = await User.generateAuthToken()
            // cookie 
            res.cookie('jwt', token, {
                expires: new Date(Date.now() + 55000),
                httpOnly: true
            })

            // await User.save();
            res.status(200).redirect('/')

        } else {
            return res.status(400).render('signup', {
                errorMsg: "Password are Not Matched"
            })
        }

    } catch (e) {
        res.status(500).send("error...")
    }
})
// login post 
router.post('/login', async (req, res) => {

    const { email, password } = req.body;
    try {
        let User = await Register.findOne({ email });
        if (!User) {
            return res.status(400).json({ error: "Invalid Crendentials email not found" })
        }
        const passwordCompare = await bcrypt.compare(password, User.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Invalid Crendentials" })
        }

        const token = await User.generateAuthToken()
        // cookie 
        res.cookie('jwt', token, {
            // expires: new Date(Date.now() + 55000),
            httpOnly: true
        })

        res.redirect('/');
    } catch (e) {
        res.status(500).send("error...")
    }

})



// fetch all books

router.get('/', auth, async (req, res) => {
    try {
        let allBooks = await Books.find({});
        res.render('index', {
            books: allBooks
        });

    } catch (e) {
        res.status(500).send('Error 500: Internal Server Error')
    }

})


router.get('/add-book', auth, (req, res) => {
    res.render('add-book');
})
router.post('/add-book', [
    body('name', 'Name Must be filled').not().isEmpty(),
    body('image', 'Image link Must be filled').not().isEmpty(),
    body('author', 'Author Name Must be filled').not().isEmpty(),
    body('pages', 'Total Pages Must be filled').not().isEmpty(),
    body('price', 'Price Must be filled').not().isEmpty(),
], auth, async (req, res) => {
    const { name, image, author, pages, price } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let Nerr = errors.array();
        return res.status(400).render('add-book', {
            errorMsg: Nerr[0].msg
        })
    }

    try {
        const newBook = new Books({
            name, image, author, pages, price
        })
        await newBook.save();
        res.redirect('/');
    } catch (e) {
        res.status(500).send('Error 500: Internal Server Error')
    }

})

// book get book details 
router.get('/update-book/:id', auth, async (req, res) => {
    try {
        const bookId = req.params.id;
        const book_one = await Books.findById(bookId)
        if (!book_one) {
            return res.status(404).json({ msg: "Not Found" })
        }
        res.render('update-book', { book: book_one });

    } catch (e) {
        res.status(404).json({
            status: false,
            msg: "Not Found"
        })
    }
})


// update book 
router.post('/update-book/:id', [
    body('name', 'Name Must be filled').not().isEmpty(),
    body('image', 'Image link Must be filled').not().isEmpty(),
    body('author', 'Author Name Must be filled').not().isEmpty(),
    body('pages', 'Total Pages Must be filled').not().isEmpty(),
    body('price', 'Price Must be filled').not().isEmpty(),
], auth, async (req, res) => {
    const { name, image, author, pages, price } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let Nerr = errors.array();
        return res.status(400).render('update-book', {
            errorMsg: Nerr[0].msg
        })
    }
    try {
        const newBookInfo = {};
        if (name) { newBookInfo.name = name }
        if (image) { newBookInfo.image = image }
        if (author) { newBookInfo.author = author }
        if (pages) { newBookInfo.pages = pages }
        if (price) { newBookInfo.price = price }

        let book = await Books.findById(req.params.id);
        if (!book) {
            return res.status(404).send('Not found')
        }
        await Books.findByIdAndUpdate(req.params.id, { $set: newBookInfo })
        res.redirect('/')
    } catch (e) {
        res.status(404).json({
            status: false,
            msg: "Not Found"
        })
    }

})

// delete book 
router.get('/delete-book/:id', auth, async (req, res) => {

    try {
        let book = await Books.findById(req.params.id);
        if (!book) {
            return res.status(404).send('Not found')
        }
        await Books.findByIdAndDelete(req.params.id)
        res.redirect('/')
    } catch (e) {
        res.status(404).json({
            status: false,
            msg: "Not Found"
        })
    }

})

module.exports = router;