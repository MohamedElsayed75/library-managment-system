const mysql = require('mysql2/promise');

////// -----------------------------------------------------------------------------
// CONFIGURATION
////// -----------------------------------------------------------------------------
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'LibraryDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

exports.pool = mysql.createPool(dbConfig);

////// -----------------------------------------------------------------------------
// QUERY HELPER
////// -----------------------------------------------------------------------------
exports.query = async function(sql, params = []) {
    const [rows] = await exports.pool.execute(sql, params);
    return rows;
};

////// -----------------------------------------------------------------------------
// ACTIVITY LOGS FUNCTIONALITY
////// -----------------------------------------------------------------------------
exports.getAllLogs = async function() {
    return exports.query('SELECT * FROM activitylogs ORDER BY timestamp DESC');
};

exports.getLogsByMember = async function(member_id) {
    return exports.query('SELECT * FROM activitylogs WHERE member_id = ? ORDER BY timestamp DESC', [member_id]);
};

exports.logAction = async function(member_id, action) {
    return exports.query('INSERT INTO activitylogs (member_id, action) VALUES (?, ?)', [member_id, action]);
};

////// -----------------------------------------------------------------------------
// MEMBER FUNCTIONALITY
////// -----------------------------------------------------------------------------
exports.getAllMembers = async function() {
    return exports.query('SELECT member_id, name, email, address, membership_date, is_admin FROM members');
};

exports.getMemberById = async function(member_id) {
    const result = await exports.query('SELECT member_id, name, email, address, membership_date, is_admin FROM members WHERE member_id = ?', [member_id]);
    return result[0] || null;
};

exports.getMemberByEmail = async function(email) {
    const result = await exports.query('SELECT * FROM members WHERE email = ?', [email]);
    return result[0] || null;
};

exports.registerMember = async function(name, email, password, address) {
    const result = await exports.query(
        'INSERT INTO members (name, email, password, address, membership_date) VALUES (?, ?, ?, ?, CURDATE())',
        [name, email, password, address]
    );
    await exports.logAction(result.insertId, 'Registered new member');
    return result.insertId;
};

exports.updateMember = async function(member_id, data) {
    const fields = [];
    const values = [];
    for (let key in data) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
    }
    values.push(member_id);
    const result = await exports.query(`UPDATE members SET ${fields.join(', ')} WHERE member_id = ?`, values);
    await exports.logAction(member_id, 'Updated member info');
    return result;
};

exports.deleteMember = async function(member_id) {
    const result = await exports.query('DELETE FROM members WHERE member_id = ?', [member_id]);
    await exports.logAction(member_id, 'Deleted member');
    return result;
};

exports.checkMemberExists = async function(member_id) {
    const result = await exports.query('SELECT COUNT(*) AS count FROM members WHERE member_id = ?', [member_id]);
    return result[0].count > 0;
};

exports.isAdmin = async function(member_id) {
    const result = await exports.query('SELECT is_admin FROM members WHERE member_id = ?', [member_id]);
    return result[0]?.is_admin === 1;
};
// ------------------------------------------------- 
// BOOK FUNCTIONALITY 
// -------------------------------------------------

// List all books (with publisher name)
exports.getAllBooks = async function(member_id = null) {
    const sql = `
        SELECT b.*, p.name AS publisher_name
        FROM books b
        LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    `;
    const books = await exports.query(sql);

    if (member_id) {
        await exports.logAction(member_id, 'Viewed all books');
    }

    return books;
};

// List all books filtered by genre
exports.getAllBooksByGenre = async function(genre = null, member_id = null) {
    let sql = `
        SELECT b.*, p.name AS publisher_name
        FROM books b
        LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
        WHERE 1=1
    `;
    const params = [];

    if (genre) {
        sql += ' AND b.genre = ?';
        params.push(genre);
    }

    const books = await exports.query(sql, params);

    if (member_id) {
        await exports.logAction(member_id, `Viewed books with genre: ${genre}`);
    }

    return books;
};


// Get book details by ID (including publisher and authors)
exports.getBookById = async function(book_id, member_id = null) {
    const sql = `
        SELECT b.*, p.name AS publisher_name,
               GROUP_CONCAT(a.name SEPARATOR ', ') AS authors
        FROM books b
        LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
        LEFT JOIN bookauthor ba ON b.book_id = ba.book_id
        LEFT JOIN author a ON ba.author_id = a.author_id
        WHERE b.book_id = ?
        GROUP BY b.book_id
    `;
    const rows = await exports.query(sql, [book_id]);

    if (member_id) {
        await exports.logAction(member_id, `Viewed details for book ID ${book_id}`);
    }

    return rows[0] || null;
};

// Add a new book
exports.createBook = async function(data, member_id) {
    const { publisher_id, isbn, title, genre, language, publication_year, author_ids = [] } = data;

    const sql = `
        INSERT INTO books (publisher_id, isbn, title, genre, language, publication_year)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await exports.query(sql, [publisher_id, isbn, title, genre, language, publication_year]);
    const book_id = result.insertId;

    // Link authors
    if (author_ids.length > 0) {
        const values = author_ids.map(author_id => [book_id, author_id]);
        const authorSql = 'INSERT INTO bookauthor (book_id, author_id) VALUES ?';
        await exports.pool.query(authorSql, [values]);
    }

    // Log activity
    if (member_id) {
        await exports.logAction(member_id, `Created new book: ${title} (ID: ${book_id})`);
    }

    return book_id;
};


// Delete a book
exports.deleteBook = async function(book_id, member_id) {
    await exports.query('DELETE FROM bookauthor WHERE book_id = ?', [book_id]);
    await exports.query('DELETE FROM bookcopies WHERE book_id = ?', [book_id]);
    await exports.query('DELETE FROM books WHERE book_id = ?', [book_id]);

    if (member_id) {
        await exports.logAction(member_id, `Deleted book ID ${book_id}`);
    }

    return true;
};

// Search books by title, ISBN, genre, or language
exports.searchBooks = async function(term, member_id = null) {
    const likeTerm = `%${term}%`;
    const sql = `
        SELECT b.*, p.name AS publisher_name
        FROM books b
        LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
        WHERE b.title LIKE ? OR b.isbn LIKE ? OR b.genre LIKE ? OR b.language LIKE ?
    `;
    const books = await exports.query(sql, [likeTerm, likeTerm, likeTerm, likeTerm]);

    if (member_id) {
        await exports.logAction(member_id, `Searched books with term: "${term}"`);
    }

    return books;
};


// -------------------------------------------------
// BOOK COPIES FUNCTIONALITY
// -------------------------------------------------

// Add a new copy for a book
exports.createCopy = function(book_id) {};

// Update copy availability
exports.updateCopy = function(copy_id, data) {};

// Delete a copy
exports.deleteCopy = function(copy_id) {};

// Check if a copy is available
exports.isCopyAvailable = function(copy_id) {};


// -------------------------------------------------
// AUTHOR FUNCTIONALITY
// -------------------------------------------------

// List all authors
exports.getAllAuthors = function() {};

// Add a new author
exports.createAuthor = function(name) {};

// Get authors of a book
exports.getAuthorsOfBook = function(book_id) {};

// Get books by an author
exports.getBooksOfAuthor = function(author_id) {};


// -------------------------------------------------
// PUBLISHER FUNCTIONALITY
// -------------------------------------------------

// List all publishers
exports.getAllPublishers = function() {};

// Get publisher by ID
exports.getPublisherById = function(publisher_id) {};

// Add a new publisher
exports.createPublisher = function(name) {};

// Update publisher name
exports.updatePublisher = function(publisher_id, name) {};

// Delete a publisher
exports.deletePublisher = function(publisher_id) {};

// Get books of a publisher
exports.getBooksByPublisher = function(publisher_id) {};


// -------------------------------------------------
// BORROW TRANSACTION FUNCTIONALITY
// -------------------------------------------------

// List all borrow transactions
exports.getAllTransactions = function() {};

// Get transaction by ID
exports.getTransactionById = function(transaction_id) {};

// Create a borrow transaction
exports.createTransaction = function(member_id, copy_id, borrow_date, due_date) {};

// Return a borrowed copy
exports.returnTransaction = function(transaction_id, returned_date) {};

// Get transactions for a member
exports.getMemberTransactions = function(member_id) {};

// List overdue transactions
exports.getOverdueTransactions = function() {};

// Check if a copy is currently borrowed
exports.isBookBorrowed = function(copy_id) {};

// Update transaction status
exports.updateTransactionStatus = function(transaction_id, status) {};


// -------------------------------------------------
// RESERVATION FUNCTIONALITY
// -------------------------------------------------

// List all reservations
exports.getAllReservations = function() {};

// Get reservation by ID
exports.getReservationById = function(reservation_id) {};

// Get reservations of a member
exports.getMemberReservations = function(member_id) {};

// Get reservations for a book
exports.getBookReservations = function(book_id) {};

// Create a new reservation
exports.createReservation = function(member_id, book_id, reservation_date) {};

// Cancel a reservation
exports.deleteReservation = function(reservation_id) {};

// Check if a book is currently reserved
exports.isBookReserved = function(book_id) {};


// -------------------------------------------------
// FINES FUNCTIONALITY
// -------------------------------------------------

// List all fines
exports.getAllFines = function() {};

// Get fine by ID
exports.getFineById = function(fine_id) {};

// Get fines for a member
exports.getFinesByMember = function(member_id) {};

// Create a new fine
exports.createFine = function(transaction_id, amount, date_issued) {};

// Pay a fine
exports.payFine = function(fine_id, payment_date) {};

// Check if a fine is paid
exports.isFinePaid = function(fine_id) {};


// -------------------------------------------------
// UTILITY CHECKS FUNCTIONALITY
// -------------------------------------------------

// Validate login (email + password)
exports.validateLogin = function(email, password) {};

// Check if email exists
exports.checkEmailExists = function(email) {};

// List books with no available copies
exports.getBooksWithNoAvailableCopies = function() {};

// Count of books borrowed by a member
exports.getMemberBorrowCount = function(member_id) {};

// Borrow history for a book
exports.getBookBorrowHistory = function(book_id) {};

// Borrow history for a member
exports.getMemberBorrowHistory = function(member_id) {};

// List books by genre
exports.getBooksByGenre = function(genre) {};

// List books by language
exports.getBooksByLanguage = function(language) {};

// List recently added books
exports.getRecentlyAddedBooks = function(limit) {};

// List top borrowed books
exports.getTopBorrowedBooks = function(limit) {};
