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

const pool = mysql.createPool(dbConfig);

////// -----------------------------------------------------------------------------
// QUERY HELPER
////// -----------------------------------------------------------------------------
async function query(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

////// -----------------------------------------------------------------------------
// ACTIVITY LOGS FUNCTIONALITY
////// -----------------------------------------------------------------------------
async function getAllLogs() {
    return query('SELECT * FROM activitylogs ORDER BY timestamp DESC');
}

async function getLogsByMember(member_id) {
    return query('SELECT * FROM activitylogs WHERE member_id = ? ORDER BY timestamp DESC', [member_id]);
}

async function logAction(member_id, action) {
    return query('INSERT INTO activitylogs (member_id, action) VALUES (?, ?)', [member_id, action]);
}

////// -----------------------------------------------------------------------------
// MEMBER FUNCTIONALITY
////// -----------------------------------------------------------------------------
async function getAllMembers() {
    return query('SELECT member_id, name, email, address, membership_date, is_admin FROM members');
}

async function getMemberById(member_id) {
    const result = await query('SELECT member_id, name, email, address, membership_date, is_admin FROM members WHERE member_id = ?', [member_id]);
    return result[0] || null;
}

async function getMemberByEmail(email) {
    const result = await query('SELECT * FROM members WHERE email = ?', [email]);
    return result[0] || null;
}

async function registerMember(name, email, password, address) {
    const result = await query(
        'INSERT INTO members (name, email, password, address, membership_date) VALUES (?, ?, ?, ?, CURDATE())',
        [name, email, password, address]
    );
    await logAction(result.insertId, 'Registered new member');
    return result.insertId;
}

async function updateMember(member_id, data) {
    const fields = [];
    const values = [];
    for (let key in data) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
    }
    values.push(member_id);
    const result = await query(`UPDATE members SET ${fields.join(', ')} WHERE member_id = ?`, values);
    await logAction(member_id, 'Updated member info');
    return result;
}

async function deleteMember(member_id) {
    const result = await query('DELETE FROM members WHERE member_id = ?', [member_id]);
    await logAction(member_id, 'Deleted member');
    return result;
}

async function checkMemberExists(member_id) {
    const result = await query('SELECT COUNT(*) AS count FROM members WHERE member_id = ?', [member_id]);
    return result[0].count > 0;
}

async function isAdmin(member_id) {
    const result = await query('SELECT is_admin FROM members WHERE member_id = ?', [member_id]);
    return result[0]?.is_admin === 1;
}

////// -----------------------------------------------------------------------------
// EXPORT EVERYTHING
////// -----------------------------------------------------------------------------
module.exports = {
    pool,
    query,
    getAllLogs,
    getLogsByMember,
    logAction,
    getAllMembers,
    getMemberById,
    getMemberByEmail,
    registerMember,
    updateMember,
    deleteMember,
    checkMemberExists,
    isAdmin
};



// -------------------------------------------------
//              BOOK FUNCTIONALITY
// -------------------------------------------------
// List all books
function getAllBooks() {}

// List all books with  filters
function getAllBooksByFilters(filters) {}

// Get book details by ID (with publisher info)
function getBookById(book_id) {}

// Add a new book
function createBook(data) {}

// Update book details
function updateBook(book_id, data) {}

// Delete a book
function deleteBook(book_id) {}

// Get books by author
function getBooksByAuthor(author_id) {}

// Get books by publisher
function getBooksByPublisher(publisher_id) {}

// Search books by title, ISBN, genre, or language
function searchBooks(term) {}



// -------------------------------------------------
//            BOOK COPIES FUNCTIONALITY
// -------------------------------------------------
// Add a new copy for a book
function createCopy(book_id) {}

// Update copy availability
function updateCopy(copy_id, data) {}

// Delete a copy
function deleteCopy(copy_id) {}

// Check if a copy is available
function isCopyAvailable(copy_id) {}


// -------------------------------------------------
//              AUTHOR FUNCTIONALITY
// -------------------------------------------------
// List all authors
function getAllAuthors() {}

// Add a new author
function createAuthor(name) {}

// Get authors of a book
function getAuthorsOfBook(book_id) {}

// Get books by an author
function getBooksOfAuthor(author_id) {}


// -------------------------------------------------
//             PUBLISHER FUNCTIONALITY
// -------------------------------------------------
// List all publishers
function getAllPublishers() {}

// Get publisher by ID
function getPublisherById(publisher_id) {}

// Add a new publisher
function createPublisher(name) {}

// Update publisher name
function updatePublisher(publisher_id, name) {}

// Delete a publisher
function deletePublisher(publisher_id) {}

// Get books of a publisher
function getBooksByPublisher(publisher_id) {}


// -------------------------------------------------
//        BORROW TRANSACTION FUNCTIONALITY
// -------------------------------------------------
// List all borrow transactions
function getAllTransactions() {}

// Get transaction by ID
function getTransactionById(transaction_id) {}

// Create a borrow transaction
function createTransaction(member_id, copy_id, borrow_date, due_date) {}

// Return a borrowed copy
function returnTransaction(transaction_id, returned_date) {}

// Get transactions for a member
function getMemberTransactions(member_id) {}

// List overdue transactions
function getOverdueTransactions() {}

// Check if a copy is currently borrowed
function isBookBorrowed(copy_id) {}

// Update transaction status
function updateTransactionStatus(transaction_id, status) {}


// -------------------------------------------------
//            RESERVATION FUNCTIONALITY
// -------------------------------------------------
// List all reservations
function getAllReservations() {}

// Get reservation by ID
function getReservationById(reservation_id) {}

// Get reservations of a member
function getMemberReservations(member_id) {}

// Get reservations for a book
function getBookReservations(book_id) {}

// Create a new reservation
function createReservation(member_id, book_id, reservation_date) {}

// Cancel a reservation
function deleteReservation(reservation_id) {}

// Check if a book is currently reserved
function isBookReserved(book_id) {}


// -------------------------------------------------
//              FINES FUNCTIONALITY
// -------------------------------------------------
// List all fines
function getAllFines() {}

// Get fine by ID
function getFineById(fine_id) {}

// Get fines for a member
function getFinesByMember(member_id) {}

// Create a new fine
function createFine(transaction_id, amount, date_issued) {}

// Pay a fine
function payFine(fine_id, payment_date) {}

// Check if a fine is paid
function isFinePaid(fine_id) {}


// -------------------------------------------------
//              UTILITY CHECKS FUNCTIONALITY
// -------------------------------------------------
// Validate login (email + password)
function validateLogin(email, password) {}

// Check if email exists
function checkEmailExists(email) {}

// List books with no available copies
function getBooksWithNoAvailableCopies() {}

// Count of books borrowed by a member
function getMemberBorrowCount(member_id) {}

// Borrow history for a book
function getBookBorrowHistory(book_id) {}

// Borrow history for a member
function getMemberBorrowHistory(member_id) {}

// List books by genre
function getBooksByGenre(genre) {}

// List books by language
function getBooksByLanguage(language) {}

// List recently added books
function getRecentlyAddedBooks(limit) {}

// List top borrowed books
function getTopBorrowedBooks(limit) {}


