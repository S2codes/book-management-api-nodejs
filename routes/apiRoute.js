const express = require('express');
const router = express.Router();
const Book = require('../server/models/Books');
const apiAuth = require('../server/middlewares/apiAuth')
const { body, validationResult } = require('express-validator');

// Add New Book api/add-book
router.post('/add-book', [
    body('name', 'Name Must be filled').not().isEmpty(),
    body('image', 'Image link Must be filled').not().isEmpty(),
    body('author', 'Author Name Must be filled').not().isEmpty(),
    body('pages', 'Total Pages Must be filled').not().isEmpty(),
    body('price', 'Price Must be filled').not().isEmpty(),
], apiAuth, async (req, res) => {
    const { name, image, author, pages, price } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ Error: errors.array() })
    }
    try {
        const newBook = new Book({
            name, image, author, pages, price
        })
        await newBook.save();
        res.json({
            status: true,
            msg: "Book Added successfully"
        })

    } catch (e) {
        res.status(500).send('Error 500')
    }

})

// fetch all books 
router.get('/all-books', apiAuth, async (req, res) => {
    try {
        const allBooks = await Book.find({});
        res.json({
            status: true,
            msg: "All Books Details Fetched",
            data: allBooks
        })
    } catch (e) {
        res.status(404).json({
            status: false,
            msg: "Not Found"
        })
    }
})
// fetch one books 
router.get('/all-books/:id', apiAuth, async (req, res) => {
    try {
        const bookId = req.params.id;
        const book_one = await Book.findById(bookId)
        if (!book_one) {
            return res.status(404).json({ msg: "Not Found" })
        }
        res.json({
            status: true,
            msg: "Book Details Fetched",
            data: book_one
        })

    } catch (e) {
        res.status(404).json({
            status: false,
            msg: "Not Found"
        })
    }
})

// update book
router.put('/all-books/:id', [
    body('name', 'Name Must be filled').not().isEmpty(),
    body('image', 'Image link Must be filled').not().isEmpty(),
    body('author', 'Author Name Must be filled').not().isEmpty(),
    body('pages', 'Total Pages Must be filled').not().isEmpty(),
    body('price', 'Price Must be filled').not().isEmpty(),
], apiAuth, async (req, res) => {
    const { name, image, author, pages, price } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ Error: errors.array() })
    }
    try {
        const newBookInfo = {};
        if (name) { newBookInfo.name = name }
        if (image) { newBookInfo.image = image }
        if (author) { newBookInfo.author = author }
        if (pages) { newBookInfo.pages = pages }
        if (price) { newBookInfo.price = price }

        let book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send('Not found')
        }
        const newbook = await Book.findByIdAndUpdate(req.params.id, { $set: newBookInfo })

        res.json({
            status: true,
            msg: "Updated Successfuly"
        })
    } catch (e) {
        res.status(404).json({
            status: false,
            msg: "Not Found"
        })
    }
})

// delete book 
router.delete('/all-books/:id', apiAuth, async (req, res) => {
    try {
        let book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send('Not found')
        }
        await Book.findByIdAndDelete(req.params.id)
        res.json({
            status: true,
            msg: "Deleted Successfuly"
        })

    } catch (e) {
        res.status(404).json({
            status: false,
            msg: "Not Found"
        })
    }
})


module.exports = router;