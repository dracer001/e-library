const express = require('express');
const router = express.Router();
const multer = require('multer');
const libraryController = require('../../controllers/libraryController');
const verifyRole = require('../../middleware/verifyRoles')

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // Limit file size to 100MB
});

router.route('/upload-book')
    .post(verifyRole('author', 'admin', 'libarian'), upload.fields([{ name: 'file' }, { name: 'image' }]), libraryController.uploadBook);

router.route('/get-books-by')
    .get(libraryController.getBooksBy);

router.route('/get-books')
    .get(libraryController.getAllBooks);

router.route('/edith-book/:id')
    .put(verifyRole('author', 'admin', 'libarian'), libraryController.edithBook)

router.route('/delete-book/:id')
    .delete(verifyRole('author', 'admin', 'libarian'), libraryController.deleteBook)

router.route('/barn-book/:id')
    .put(verifyRole('admin', 'libarian'), libraryController.barnBook)


module.exports = router;
