const Library = require('../models/library');
const {checkNull, dissalowKey} = require('./dataFilter');


const getAllBooks = async(req, res) => {
    try{
        const BOOKs = await Library.find({barn: "false"});
        if (BOOKs.length === 0) return res.status(404).json({ "message": "no data found" });

        const booksWithBase64Files = BOOKs.map(book => {
            const fileBase64 = book.file_data ? book.file_data.toString('base64') : null;
            const imageBase64 = book.image_data ? book.image_data.toString('base64') : null;
            return {
                ...book.toObject(),
                file_data: fileBase64,
                image_data: imageBase64
            };
        });

        return res.status(200).json(booksWithBase64Files);
    } catch (err) {
        res.status(500).json({ "error": err });
    }
}

const getBooksBy = async (req, res) => {
    const allowedFields = ["id", "title", "author", "summary", "version", "availability", "publisher"];
    const field = req.body?.field;
    const data = req.body?.data;

    if (!field) return res.status(400).json({ "error": "required field info" });
    if (!data) return res.status(400).json({ "error": "required data info" });
    if (!allowedFields.includes(field)) return res.status(403).json({ "error": `cannot get data by ${field}` });

    try {
        const regex = new RegExp(`^${data}`, 'i'); // 'i' makes it case-insensitive
        const query = { [field]: regex };

        const BOOKs = await Library.find(query);
        if (BOOKs.length === 0) return res.status(404).json({ "message": "no data found" });

        const booksWithBase64Files = BOOKs.map(book => {
            const fileBase64 = book.file_data ? book.file_data.toString('base64') : null;
            const imageBase64 = book.image_data ? book.image_data.toString('base64') : null;
            return {
                ...book.toObject(),
                file_data: fileBase64,
                image_data: imageBase64
            };
        });

        return res.status(200).json(booksWithBase64Files);
    } catch (err) {
        res.status(500).json({ "error": err });
    }
};


const uploadBook = async (req, res) => {
    if(!(req.user.roles.includes('libarian') || req.user.roles.includes('admin')) 
        && (!req.files || !req.files.file || req.files.file.length === 0) ) 
    return res.status(400).json({ error: 'E-book file is required' });
    try {
        console.log(req.body);

        const uploader_id = req.user.id
        const required_data = ["title", "author","summary", "version", "availability", "publisher"];
        const message = checkNull(required_data, req.body);
        if(message) return res.status(400).json({"message": message});
        const { title, author, category, summary, publisher, version, availability, sale_price, loan_price, rating, published_date} = req.body;

        // File and image data from the form
        const file = req.files['file'][0];
        const image = req.files['image'] ? req.files['image'][0] : null;

        const newLibraryItem = new Library({
            title,
            author,
            category: category ? category.split(',') : [],
            summary,
            publisher,
            version: version.split(','),
            availability: availability.split(','),
            sale_price: parseFloat(sale_price) || 0.0,
            loan_price: parseFloat(loan_price) || 0.0,
            rating: parseFloat(rating) || 0.0,
            published_date: published_date ? new Date(published_date) : Date.now(),
            upload_date: Date.now(),
            file_data: file ? file.buffer : null,
            file_mimetype: file ? file.mimetype : null,
            image_data: image ? image.buffer : null,
            image_mimetype: image ? image.mimetype : null,
            uploader_id
        });

        const newItem = await newLibraryItem.save();
        console.log(newItem);
        res.status(201).json("new book record added to library");
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
};

const edithBook = async (req, res) => {
    const uploader_id = req.user.id;
    let book_update = req.body;
    const unauthorizedKey = ["barn", "_id", "id"]
    const message = dissalowKey(unauthorizedKey, book_update);
    if (message) return res.status(400).json({ "error": message });
    try {
        const book_id = req.param?.id;
        if(!book_id || book_id.length == 0) return res.status(400).json({"error": "Book id missing"})
        const Book = Library.findById(book_id);
        if(!Book) return res.status(404).json({"error": "Book record not found"});
        if(Book.uploader_id !== uploader_id) return res.status(403).json({"error": "access denied"});
        let updateFields = [];
        for (let key in book_update) {
            if (Book[key] !== undefined) {
                Book[key] = book_update[key];
                updateFields.push(key);
            }
        }

        if(req.files && req.files.file && req.files.file.length > 0){
            Book.file_data = req.files['file'][0].buffer;
            Book.file_mimetype = req.files['file'][0].mimetype;
            updateFields.push("file");
            
        } 
        if(req.files['image']){
            Book.image = req.files['image'].buffer;
            Book.image_mimetype = req.files['image'].mimetype;
            updateFields.push("file-image");

        }
        await USER.findByIdAndUpdate(Book.id, Book, {
        runValidators: true // Validate the updates against the schema
        });
        logEvent(`Book data updated, BookId => ${Book.id}, fields => ${updateFields}`, 'libraryLog.txt');
        return res.status(200).json({"message": `update successful, \n fields=>${updateFields}`}); // Send the updated user document as the response
    } catch (err) {
        return res.status(500).json({ "error": err.message});
    }
};

const deleteBook = async (req, res)=>{
    const user_id = req.user.id;
    try {
        const book_id = req.param?.id;
        if(!book_id || book_id.length == 0) return res.status(400).json({"error": "Book id missing"})
        const Book = Library.findById(book_id);
        if(!Book) return res.status(404).json({"error": "Book record not found"});
        if(Book.uploader_id !== user_id) return res.status(403).json({"error": "access denied"});
        const deleteStatus = await USER.findByIdAndDelete(Book.id);
        logEvent(`Book data deleted, BookId => ${Book.id}`, 'libraryLog.txt');
        console.log(deleteStatus);
        if(deleteStatus) return res.status(200).json({"message": 'delete successful'}); // Send the updated user document as the response
    } catch (err) {
        return res.status(500).json({ "error": err.message});
    }
}



const barnBook = async (req, res) => {
    const book_id = req.param?.id;
    const option = req.body?.option;
    if(!book_id || book_id.length == 0) return res.status(400).json({"error": "Book id missing"})
    try{
        if (req.body?.option == 'barn') {
            const book_barn = Library.findByIdAndUpdate(book_id, {"barn": true});
            logEvent(`Book barned, BookId => ${Book.id}`, 'libraryLog.txt');
            return res.status(200).json({"message": `book succesfully barned`}); // Send the updated user document as the response
            
        } else if(req.body?.option == 'unbarn'){
            const book_barn = Library.findByIdAndUpdate(book_id, {"barn": false});  
            logEvent(`Book unbarned, BookId => ${Book.id}`, 'libraryLog.txt');
            return res.status(200).json({"message": `book successful unbarned`}); // Send the updated user document as the response
        }

    }  
    catch (err) {
        return res.status(500).json({ "error": err.message});
    }
};






// const getByID = async(req, res) => {
//     try {
//         const { id } = req.params;

//         // Find the document by ID
//         const book = await Library.findById(id);
//         if (!book) {
//             return res.status(404).json({ "error": "Book not found" });
//         }

// // Check if image data exists
// if (!book.image_data || !book.image_mimetype) {
//     return res.status(404).json({ "error": "Image not found" });
// }

// // Set the appropriate headers to display the image
// res.set('Content-Type', book.image_mimetype);

// // Send the image buffer as a response
// res.send(book.image_data);
//     } catch (err) {
//         console.error('Error retrieving file:', err);
//         res.status(500).json({ "error": "Internal Server Error" });
//     }
// };
// const getByID = async(req, res) => {
//     try {
//         const { id } = req.params;

//         // Find the document by ID
//         const book = await Library.findById(id);
//         if (!book) {
//             return res.status(404).json({ "error": "Book not found" });
//         }

//         // Check if file data exists
//         if (!book.file_data || !book.file_mimetype) {
//             return res.status(404).json({ "error": "File not found" });
//         }

//         // Set the appropriate headers and send the file
//         res.set({
//             'Content-Type': book.file_mimetype,
//             'Content-Disposition': `attachment; filename="${book.title}.pdf"` // Adjust filename and extension as needed
//         });

//         // Send the file buffer as a response
//         res.send(book.file_data);
//     } catch (err) {
//         console.error('Error retrieving file:', err);
//         res.status(500).json({ "error": "Internal Server Error" });
//     }
// };


module.exports = {
    uploadBook,
    getBooksBy,
    getAllBooks,
    edithBook,
    deleteBook,
    barnBook
};
