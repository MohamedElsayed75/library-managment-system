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
exports.getLogsByMember = async function(member_id) {
    return exports.query('SELECT * FROM activitylogs WHERE member_id = ? ORDER BY timestamp DESC', [member_id]);
};

exports.logAction = async function(member_id, action) {
    return exports.query('INSERT INTO activitylogs (member_id, action) VALUES (?, ?)', [member_id, action]);
};

////// -----------------------------------------------------------------------------
// MEMBER FUNCTIONALITY
////// -----------------------------------------------------------------------------

exports.getMemberByEmail = async function(email) {
    const result = await exports.query('SELECT * FROM members WHERE email = ?', [email]);
    return result[0] || null;
};

exports.registerMember = async function(name, email, password, address) {
    const result = await exports.query(
        'INSERT INTO members (name, email, password, address, membership_date) VALUES (?, ?, ?, ?, NOW())',
        [name, email, password, address]
    );
    await exports.logAction(result.insertId, 'Registered new member');
    return result.insertId;
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

exports.getBorrowedBooksByMember = async function(memberId) {
    const sql = `
        SELECT 
            m.member_id,
            bt.transaction_id,
            b.book_id,
            b.title AS book_title,
            DATEDIFF(bt.due_date, CURRENT_DATE()) AS days_remaining
        FROM members m
        JOIN borrowtransactions bt ON m.member_id = bt.member_id
        JOIN bookcopies bc ON bt.copy_id = bc.copy_id
        JOIN books b ON bc.book_id = b.book_id
        WHERE m.member_id = ?
        AND bt.status in  ('borrowed', 'overdue');
    `;

    return await exports.query(sql, [memberId]);
};

exports.getProfileData = async function(memberId) {

    // Get total fines 
    const fineRows = await exports.query(
        `SELECT COALESCE(SUM(f.amount), 0) AS total_fines
         FROM fines f
         INNER JOIN borrowtransactions bt ON f.transaction_id = bt.transaction_id
         WHERE bt.member_id = ? AND f.payment_status = 0`,
        [memberId]
    );
    const totalFines = fineRows[0].total_fines;

    // Get borrowed books 
    const borrowedBooks = await exports.getBorrowedBooksByMember(memberId);

    // Get reserved books 
    const reservedBooks = await exports.query(
        `SELECT 
            r.reservation_id,
            r.reservation_date,
            b.book_id,
            b.title,
            a.name AS author,
            b.genre,
            b.language,
            b.publication_year
         FROM reservations r
         INNER JOIN books b ON r.book_id = b.book_id
         INNER JOIN author a ON b.author_id = a.author_id
         WHERE r.member_id = ?`,
        [memberId]
    );

    return { totalFines, borrowedBooks, reservedBooks };
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

    // 2. Create transaction
    const result = await exports.query(
        `INSERT INTO borrowtransactions 
            (member_id, copy_id, borrow_date, due_date, status)
        VALUES (
            ?, 
            ?, 
            NOW(),
            DATE_ADD(NOW(), INTERVAL 1 MINUTE),
            'borrowed'
        )`,
        [member_id, copy_id]
    );
// NOW(),
// DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY),
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
exports.returnTransaction = async function(transaction_id) {
    try {
        // Get transaction to identify member and copy
        const transaction = await exports.getTransactionById(transaction_id);
        if (!transaction.length) {
            return { success: false, error: `Transaction ID ${transaction_id} not found.` };
        }

        const { member_id, copy_id } = transaction[0];

        // Mark the copy available again
        await exports.query(
            'UPDATE bookcopies SET availability = TRUE WHERE copy_id = ?',
            [copy_id]
        );

        // Update transaction record
        await exports.query(
            `UPDATE borrowtransactions 
             SET returned_date = CURRENT_DATE(), status = 'returned' 
             WHERE transaction_id = ?`,
            [transaction_id]
        );

        // Log activity
        await exports.logAction(member_id, `Returned copy ID ${copy_id}`);

        return { success: true };

    } catch (err) {
        console.error(`Error returning transaction ID ${transaction_id}:`, err);
        return { success: false, error: err.message };
    }
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
exports.getBookById = async function(book_id) {
    // Get book + author + publisher
    const sqlBook = `
        SELECT b.*, a.name AS author_name, p.name AS publisher_name
        FROM books b
        JOIN author a ON b.author_id = a.author_id
        LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
        WHERE b.book_id = ?
        LIMIT 1;
    `;

    const rows = await exports.query(sqlBook, [book_id]);
    const book = rows[0];

    if (!book) return null;

    // Get list of all copies for this book
    const sqlCopies = `
        SELECT copy_id, availability
        FROM bookcopies
        WHERE book_id = ?;
    `;
    const copies = await exports.query(sqlCopies, [book_id]);

    book.copies = copies;

    return book;
};

// Add a new book
exports.createBook = async function(data, member_id) {
    const {
        isbn,
        title,
        genre,
        language,
        author,
        year,
        publisher
    } = data;

    try {
        let author_id, publisher_id;

        // ----------------------------
        // Check / insert author
        // ----------------------------
        const authorRows = await exports.query(
            `SELECT author_id FROM author WHERE name = ?`, [author]
        );

        if (authorRows.length) {
            author_id = authorRows[0].author_id;
        } else {
            const result = await exports.query(
                `INSERT INTO author (name) VALUES (?)`, [author]
            );
            author_id = result.insertId;
        }

        // ----------------------------
        // Check / insert publisher
        // ----------------------------
        if (publisher) {
            const publisherRows = await exports.query(
                `SELECT publisher_id FROM publishers WHERE name = ?`, [publisher]
            );

            if (publisherRows.length) {
                publisher_id = publisherRows[0].publisher_id;
            } else {
                const result = await exports.query(
                    `INSERT INTO publishers (name) VALUES (?)`, [publisher]
                );
                publisher_id = result.insertId;
            }
        } else {
            publisher_id = null;
        }

        // ----------------------------
        // Insert book
        // ----------------------------
        const bookResult = await exports.query(
            `INSERT INTO books
                (title, isbn, genre, language, publication_year, author_id, publisher_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, isbn, genre, language, year, author_id, publisher_id]
        );

        const book_id = bookResult.insertId;

        // ----------------------------
        // Log activity
        // ----------------------------
        if (member_id) {
            await exports.logAction(member_id, `Created new book: ${title} (ID: ${book_id})`);
        }



        return { book_id };

    } catch (err) {
        console.error("Error creating book:", err);
        throw err;
    }
};



// Delete a book
exports.deleteBook = async function(book_id, member_id) {
    // Delete copies first
    await exports.query('DELETE FROM bookcopies WHERE book_id = ?', [book_id]);

    // Delete the book
    await exports.query('DELETE FROM books WHERE book_id = ?', [book_id]);

    // Log activity
    if (member_id) {
        await exports.logAction(member_id, `Deleted book ID ${book_id}`);
    }

    return true;
};


// Search books by title, ISBN, genre, or language
exports.searchBooks = async function(searchTerm) {
  const sql = `
    SELECT 
        b.*,
        a.name AS author_name,
        p.name AS publisher_name,
        COUNT(bc.copy_id) AS copy_count
    FROM books b
    JOIN author a ON b.author_id = a.author_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    LEFT JOIN bookcopies bc ON b.book_id = bc.book_id
    WHERE 
        b.title LIKE CONCAT('%', ?, '%')
        OR b.isbn LIKE CONCAT('%', ?, '%')
        OR b.genre LIKE CONCAT('%', ?, '%')
        OR b.language LIKE CONCAT('%', ?, '%')
        OR a.name LIKE CONCAT('%', ?, '%')
        OR p.name LIKE CONCAT('%', ?, '%')
    GROUP BY b.book_id
    ORDER BY b.title ASC;
  `;

  const params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
  return exports.query(sql, params);
};


// -------------------------------------------------
// BOOK COPIES FUNCTIONALITY
// -------------------------------------------------

// Add a new copy for a book
exports.createCopy = async function(book_id, member_id) {
    // Insert a new copy for the given book
    const result = await exports.query(
        'INSERT INTO bookcopies (book_id, availability) VALUES (?, TRUE)',
        [book_id]
    );

    const copy_id = result.insertId;

    if (member_id) {
        await exports.logAction(member_id, `Added new copy ID ${copy_id} for book ID ${book_id}`);
    }

    return copy_id;
};

// ------------------------------------------------- 
// BORROW TRANSACTION FUNCTIONALITY
// -------------------------------------------------
// Get transaction by ID
exports.getTransactionById = function(transaction_id) {
    return exports.query(
        'SELECT * FROM borrowtransactions WHERE transaction_id = ?',
        [transaction_id]
    );
};


// -------------------------------------------------
// FINES FUNCTIONALITY
// -------------------------------------------------

exports.createFine = async function(transactionId, memberId) {
    //// -------> Function: Creates a fine for a transaction

    // Check if fine already exists for this transaction
    const existing = await exports.query(
        `SELECT fine_id FROM fines WHERE transaction_id = ?`,
        [transactionId]
    );

    if (existing.length > 0) {
        return; // fine already added, do nothing
    }

    // Add one-time $20 fine
    await exports.query(
        `INSERT INTO fines (transaction_id, amount, date_issued, payment_status)
         VALUES (?, 20, NOW(), 0)`,
        [transactionId]
    );

    // set transaction status to overdue
    await exports.query(
        `UPDATE borrowtransactions SET status = 'overdue' WHERE transaction_id = ?`,
        [transactionId]
    );

    console.log(`Added fine for overdue return, transaction ID ${transactionId}`);
    //log activity
    await exports.logAction(memberId, `Added fine for overdue return, transaction ID ${transactionId}`);
};

exports.checkAndApplyFines = async function(memberId) {
    //// -------> Function: Checks for overdue transactions and apply fines

    // Find all overdue transactions WITH NO recorded fine
    const rows = await exports.query(
        `SELECT bt.transaction_id
         FROM borrowtransactions bt
         LEFT JOIN fines f ON bt.transaction_id = f.transaction_id
         WHERE bt.member_id = ?
           AND bt.returned_date IS NULL
           AND bt.due_date < NOW()
           AND f.transaction_id IS NULL`,
        [memberId]
    );
    for (const row of rows) {
        await exports.createFine(row.transaction_id, memberId);
    }
};

exports.payFines = async function(memberId) {
    //// -------> Pays all unpaid fines for a member

    await exports.query(
        `UPDATE fines f
         INNER JOIN borrowtransactions bt ON f.transaction_id = bt.transaction_id
         SET f.payment_status = 1,
             f.payment_date = NOW()
         WHERE bt.member_id = ? AND f.payment_status = 0`,
        [memberId]
    );

    await exports.logAction(memberId, `Paid all fines`);
};