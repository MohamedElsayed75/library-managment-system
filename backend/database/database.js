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

exports.checkMemberExists = async function(member_id) {
    const result = await exports.query('SELECT COUNT(*) AS count FROM members WHERE member_id = ?', [member_id]);
    return result[0].count > 0;
};

exports.isAdmin = async function(member_id) {
    const result = await exports.query('SELECT is_admin FROM members WHERE member_id = ?', [member_id]);
    return result[0]?.is_admin === 1;
};

// Check if member has overdue borrow transactions
exports.hasOverdueTransactions = async function(member_id) {
    const rows = await exports.query(
        `
        SELECT transaction_id 
        FROM borrowtransactions
        WHERE member_id = ?
          AND (
                status = 'overdue'
                OR (status = 'borrowed' AND due_date < CURRENT_DATE())
              )
        LIMIT 1
        `,
        [member_id]
    );

    // return true if at least 1 overdue transaction exists
    return rows.length > 0;
};

// ------------------------------------------------- 
// BOOK FUNCTIONALITY 
// -------------------------------------------------

// List all books
exports.getAllBooks = async function () {
  const sql = `SELECT * FROM view_books_full ORDER BY title ASC;`;
  return exports.query(sql);
}


// Get book details by ID 
exports.getBookById = async function (book_id) {
    // Get book aggregated data (from view)
    const sqlBook = `
        SELECT *
        FROM view_books_full
        WHERE book_id = ?
        LIMIT 1;
    `;

    const rows = await exports.query(sqlBook, [book_id]);
    const book = rows[0];

    if (!book) return null;

    // Get list of all copies for this book
    const sqlCopies = `
        SELECT 
            copy_id,
            availability
        FROM bookcopies
        WHERE book_id = ?;
    `;

    const copies = await exports.query(sqlCopies, [book_id]);

    // Attach copies to response
    book.copies = copies;

    return book;
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
exports.searchBooks = async function (searchTerm) {
  const sql = `
    SELECT *
    FROM view_books_full
    WHERE 
      title LIKE CONCAT('%', ?, '%')
      OR isbn LIKE CONCAT('%', ?, '%')
      OR genre LIKE CONCAT('%', ?, '%')
      OR language LIKE CONCAT('%', ?, '%')
      OR authors LIKE CONCAT('%', ?, '%')
      OR publisher_name LIKE CONCAT('%', ?, '%')
    ORDER BY title ASC;
  `;

  const params = [
    searchTerm,
    searchTerm,
    searchTerm,
    searchTerm,
    searchTerm,
    searchTerm
  ];

  return exports.query(sql, params);
}

// -------------------------------------------------
// BOOK COPIES FUNCTIONALITY
// -------------------------------------------------

// Add a new copy for a book
exports.createCopy = function(book_id) {};

// Update copy availability
exports.updateCopy = function(copy_id, data) {};




// ------------------------------------------------- 
// BORROW TRANSACTION FUNCTIONALITY
// -------------------------------------------------

// List all borrow transactions
exports.getAllTransactions = function() {
    return exports.query('SELECT * FROM borrowtransactions ORDER BY borrow_date DESC');
};

// Get transaction by ID
exports.getTransactionById = function(transaction_id) {
    return exports.query(
        'SELECT * FROM borrowtransactions WHERE transaction_id = ?',
        [transaction_id]
    );
};

// Create a borrow transaction 
exports.createTransaction = async function(member_id, book_id) {

    // 1. Find first available copy for this book
    const copies = await exports.query(
        `SELECT copy_id FROM bookcopies 
         WHERE book_id = ? AND availability = TRUE 
         ORDER BY copy_id ASC 
         LIMIT 1`,
        [book_id]
    );

    if (copies.length === 0) {
        return { error: "No available copies for this book." };
    }

    const copy_id = copies[0].copy_id;

    // 2. Create transaction with auto dates
    const result = await exports.query(
        `INSERT INTO borrowtransactions 
            (member_id, copy_id, borrow_date, due_date, status)
         VALUES (
            ?, 
            ?, 
            CURRENT_DATE(),
            DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY),
            'borrowed'
         )`,
        [member_id, copy_id]
    );

    // 3. Mark copy unavailable
    await exports.query(
        'UPDATE bookcopies SET availability = FALSE WHERE copy_id = ?',
        [copy_id]
    );

    // 4. Log the activity
    await exports.logAction(
        member_id, 
        `Borrowed book_id ${book_id} using copy ${copy_id}`
    );

    return { success: true };
};


// Return a borrowed copy
exports.returnTransaction = async function(transaction_id, returned_date) {
    // Get transaction to identify member and copy
    const transaction = await exports.getTransactionById(transaction_id);
    if (!transaction.length) return null;

    const { member_id, copy_id } = transaction[0];

    // Update transaction record
    await exports.query(
        `UPDATE borrowtransactions 
         SET returned_date = ?, status = 'returned' 
         WHERE transaction_id = ?`,
        [returned_date, transaction_id]
    );

    // Mark the copy available again
    await exports.query(
        'UPDATE bookcopies SET availability = TRUE WHERE copy_id = ?',
        [copy_id]
    );

    // Log activity
    await exports.logAction(member_id, `Returned copy ID ${copy_id}`);

    return true;
};

// Get transactions for a member
exports.getMemberTransactions = function(member_id) {
    return exports.query(
        'SELECT * FROM borrowtransactions WHERE member_id = ? ORDER BY borrow_date DESC',
        [member_id]
    );
};

// List overdue transactions
exports.getOverdueTransactions = function() {
    return exports.query(
        `SELECT * FROM borrowtransactions 
         WHERE status = 'overdue'`
    );
};

// Check if a copy is currently borrowed
exports.isBookBorrowed = async function(copy_id) {
    const rows = await exports.query(
        `SELECT * FROM borrowtransactions 
         WHERE copy_id = ? AND status = 'borrowed'`,
        [copy_id]
    );
    return rows.length > 0; // true if currently borrowed
};

// Update transaction status (borrowed, returned, overdue)
exports.updateTransactionStatus = async function(transaction_id, status) {

    // Update DB
    const result = await exports.query(
        `UPDATE borrowtransactions SET status = ? WHERE transaction_id = ?`,
        [status, transaction_id]
    );

    // Log action (if transaction exists)
    const tx = await exports.getTransactionById(transaction_id);
    if (tx.length) {
        const { member_id, copy_id } = tx[0];
        await exports.logAction(
            member_id, 
            `Transaction ${transaction_id} status updated to ${status} (Copy ID ${copy_id})`
        );
    }

    return result;
};



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
