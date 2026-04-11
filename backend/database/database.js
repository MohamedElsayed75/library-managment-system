const mysql = require('mysql2/promise');

// -----------------------------------------------------------------------------
// CONFIGURATION & CORE UTILITIES
// -----------------------------------------------------------------------------

/**
 * Database connection configuration for the LibraryDB.
 */
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'LibraryDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create the connection pool and export it
exports.pool = mysql.createPool(dbConfig);

/**
 * Executes a SQL query against the database pool.
 * @param {string} sql - The SQL query string.
 * @param {Array<any>} [params=[]] - An array of parameters for the query.
 * @returns {Promise<Array<Object>>} - The resulting **rows** (array of plain objects) from the query.
 */
exports.query = async function(sql, params = []) {
    const [rows] = await exports.pool.execute(sql, params);
    return rows;
};

// -----------------------------------------------------------------------------
// ACTIVITY LOGS FUNCTIONALITY
// -----------------------------------------------------------------------------

/**
 * Logs an action performed by a member.
 * @param {number} member_id - The ID of the member performing the action.
 * @param {string} action - A description of the action.
 * @returns {Promise<Object>} - The MySQL insert result object (contains `insertId`).
 */
exports.logAction = async function(member_id, action) {
    return exports.query('INSERT INTO activitylogs (member_id, action) VALUES (?, ?)', [member_id, action]);
};

// -----------------------------------------------------------------------------
// MEMBER FUNCTIONALITY
// -----------------------------------------------------------------------------

/**
 * Registers a new member in the database.
 * @param {string} name - Member's name.
 * @param {string} email - Member's email (unique identifier).
 * @param {string} password - Member's password (hashed in a real application).
 * @param {string} address - Member's physical address.
 * @returns {Promise<number>} - The `member_id` of the newly registered member.
 */
exports.registerMember = async function(name, email, password, address) {
    const result = await exports.query(
        'INSERT INTO members (name, email, password, address, membership_date) VALUES (?, ?, ?, ?, NOW())',
        [name, email, password, address]
    );
    await exports.logAction(result.insertId, 'Registered new member');
    return result.insertId;
};

/**
 * Retrieves a member's record by their email address.
 * @param {string} email - The email of the member.
 * @returns {Promise<{member_id: number, name: string, email: string, ...}|null>} - The member object or null if not found.
 */
exports.getMemberByEmail = async function(email) {
    const result = await exports.query('SELECT * FROM members WHERE email = ?', [email]);
    return result[0] || null;
};

/**
 * Checks if a member has any overdue borrow transactions.
 * @param {number} member_id - The ID of the member.
 * @returns {Promise<boolean>} - True if at least one overdue transaction exists, otherwise false.
 */
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

/**
 * Checks if a member has reached the borrow/reservation limit (3 books total).
 * @param {number} member_id - The ID of the member.
 * @returns {Promise<boolean>} - True if the member has reached the limit, otherwise false.
 */
exports.hasReachedBorrowLimit = async function(member_id) {
  // Count currently borrowed books
  const borrowedRows = await exports.query(
    `
    SELECT COUNT(*) AS borrowedCount
    FROM borrowtransactions
    WHERE member_id = ?
      AND status = 'borrowed'
    `,
    [member_id]
  );
  const borrowedCount = borrowedRows[0].borrowedCount;

  // Count active reservations
  const reservedRows = await exports.query(
    `
    SELECT COUNT(*) AS reservedCount
    FROM reservations
    WHERE member_id = ?
    `,
    [member_id]
  );
  const reservedCount = reservedRows[0].reservedCount;

  const total = borrowedCount + reservedCount;

  // Return true if total borrowed + reserved >= 3
  return total >= 3;
};

/**
 * Checks if a member has borrowed a specific book.
 * @param {number} member_id - The ID of the member.
 * @param {number} book_id - The ID of the book.
 * @returns {Promise<boolean>} - True if the member has borrowed the book, otherwise false.
 */
exports.hasBorrowedBook = async function(member_id, book_id) {
    //check if member already borrowed a copy of this book
    const rows = await exports.query(
        `
        SELECT transaction_id
        FROM borrowtransactions
        WHERE member_id = ?
          AND status = 'borrowed'
          AND copy_id IN (
            SELECT copy_id
            FROM bookcopies
            WHERE book_id = ?
          )
        LIMIT 1
        `,
        [member_id, book_id]
    );

    // return true if at least 1 borrowed transaction exists
    return rows.length > 0;
}

/**
 * Retrieves a list of books currently borrowed by a member.
 * @param {number} memberId - The ID of the member.
 * @returns {Promise<Array<{member_id: number, transaction_id: number, book_id: number, book_title: string, days_remaining: number}>>} - A list of borrowed books with transaction details.
 */
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
        AND bt.status in ('borrowed', 'overdue');
    `;

    return await exports.query(sql, [memberId]);
};

/**
 * Checks if a book is reserved by a specific member.
 * @param {number} member_id - The ID of the member.
 * @param {number} book_id - The ID of the book.
 * @returns {Promise<boolean>} - True if the book is reserved by the member, otherwise false.
 */
exports.isBookReservedByMember = async function(member_id, book_id) {
  const rows = await exports.query(
    'SELECT * FROM reservations WHERE member_id = ? AND book_id = ?',
    [member_id, book_id]
  );
  return rows.length > 0; // true if reserved
};

/**
 * Reserves a book for a member.
 * @param {number} member_id - The ID of the member.
 * @param {number} book_id - The ID of the book.
 * @returns {Promise<{success: boolean, message: string}>} - An object indicating success and a message.        
 */
exports.reserveBook = async function(member_id, book_id) {
  // Insert new reservation
  const now = new Date();
  await exports.query(
    'INSERT INTO reservations (member_id, book_id, reservation_date) VALUES (?, ?, ?)',
    [member_id, book_id, now]
  );

  //log reservation
  await exports.logAction(member_id, `Reserved book ${book_id}.`);

  return { success: true, message: 'Book reserved successfully.' };
};

/**
 * Retrieves a list of reservations for a member.
 * @param {number} member_id - The ID of the member.
 * @returns {Promise<Array<{reservation_id: number, book_title: string, isbn: string, reservation_date: Date}>>} - A list of reservations with book details.
 */
exports.getReservationsForMember = async function(member_id) {
  const rows = await exports.query(
    `SELECT r.reservation_id, b.title as book_title, b.isbn, r.reservation_date, b.book_id 
    FROM reservations r 
    JOIN books b ON r.book_id = b.book_id
    WHERE r.member_id = ? 
    ORDER BY r.reservation_date DESC`,
    [member_id]
  );
  return rows;
};

/**
 * Cancels a reservation for a member.
 * @param {number} reservation_id - The ID of the reservation.
 * @param {number} member_id - The ID of the member.
 * @returns {Promise<{success: boolean, message: string}>} - An object indicating success and a message.
 */
exports.cancelReservation = async function(member_id, book_id) {
  // Check if reservation exists
  const res = await exports.query(
    'SELECT * FROM reservations WHERE member_id = ? AND book_id = ?',
    [member_id, book_id]
  );

  if (res.length === 0) {
    return { error: 'Reservation not found.' };
  }

  const reservation_id = res[0].reservation_id;

  // Delete the reservation
  await exports.query('DELETE FROM reservations WHERE reservation_id = ?', [reservation_id]);

  // Log the cancellation
  await exports.logAction(member_id, `Canceled reservation for book ${book_id}`);

  return { success: true, message: 'Reservation canceled successfully.' };
};


/**
 * Gathers profile-related data for a member, including fines, borrowed, and reserved books.
 * @param {number} memberId - The ID of the member.
 * @returns {Promise<{totalFines: string, borrowedBooks: Array<Object>, reservedBooks: Array<Object>}>} - An object containing total fines (as string), borrowed books, and reserved books.
 */
exports.getProfileData = async function(memberId) {

    // Get total fines
    const fineRows = await exports.query(
        `SELECT COALESCE(SUM(f.amount), 0) AS total_fines
         FROM fines f
         INNER JOIN borrowtransactions bt ON f.transaction_id = bt.transaction_id
         WHERE bt.member_id = ? AND f.payment_status = 0`,
        [memberId]
    );
    const totalFines = fineRows[0].total_fines; // Note: SQL returns DECIMAL/SUM as string or number depending on driver settings

    // Get borrowed books
    const borrowedBooks = await exports.getBorrowedBooksByMember(memberId);

    // Get reserved books
    const reservedBooks = await exports.getReservationsForMember(memberId);

    return { totalFines, borrowedBooks, reservedBooks };
};


// -----------------------------------------------------------------------------
// BOOK FUNCTIONALITY 
// -----------------------------------------------------------------------------

/**
 * Retrieves detailed information for a specific book, including its copies.
 * @param {number} book_id - The ID of the book.
 * @returns {Promise<{book_id: number, title: string, author_name: string, publisher_name: string, copies: Array<{copy_id: number, availability: boolean}>}|null>} - The book object with a 'copies' array, or null if not found.
 */
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

/**
 * Retrieves a list of all books from the database.
 * @returns {Promise<Array<{book_id: number, title: string, author_name: string, publisher_name: string, copy_count: number}>>} - List of all books based on `view_books_full`.
 */
exports.getAllBooks = async function () {
    const sql = `SELECT * FROM view_books_full ORDER BY title ASC;`;
    return exports.query(sql);
}

/**
 * Creates a new book record, and inserts the author/publisher if they don't exist.
 * @param {Object} data - Book details (isbn, title, genre, language, author, year, publisher).
 * @param {number} member_id - The ID of the member adding the book (for logging).
 * @returns {Promise<{book_id: number}>} - The ID of the newly created book.
 * @throws {Error} - If there is a database error during book creation.
 */
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
        await exports.logAction(member_id, `Created new book: ${title} (ID: ${book_id})`);


        return { book_id };

    } catch (err) {
        console.error("Error creating book:", err);
        throw err;
    }
};

/**
 * Searches books by matching the search term against title, ISBN, genre, language, author, or publisher name.
 * @param {string} searchTerm - The term to search for.
 * @returns {Promise<Array<{book_id: number, title: string, author_name: string, publisher_name: string, copy_count: number}>>} - A list of matching books with copy count.
 */
exports.searchBooks = async function(searchTerm) {
    const sql = `
        SELECT
            b.*,
            a.name AS author_name,
            p.name AS publisher_name,
            COUNT(CASE WHEN bc.availability = 1 THEN bc.copy_id END) AS copy_count
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

// -----------------------------------------------------------------------------
// BOOK COPIES FUNCTIONALITY
// -----------------------------------------------------------------------------

/**
 * Adds a new copy record for an existing book.
 * @param {number} book_id - The ID of the book to add a copy for.
 * @param {number} member_id - The ID of the member adding the copy (for logging).
 * @returns {Promise<number>} - The `copy_id` of the newly created copy.
 */
exports.createCopy = async function(book_id, member_id) {
    // Insert a new copy for the given book
    const result = await exports.query(
        'INSERT INTO bookcopies (book_id, availability) VALUES (?, TRUE)',
        [book_id]
    );

    const copy_id = result.insertId;

    await exports.logAction(member_id, `Added new copy ID ${copy_id} for book ID ${book_id}`);

    return copy_id;
};

/**
 * Finds and deletes one available copy of a specified book.
 * @param {number} bookId - The ID of the book.
 * @param {number} memberId - The ID of the member performing the deletion (for logging).
 * @returns {Promise<{success: boolean, message: string, deletedCopyId?: number}>} - Success status, message, and the deleted copy ID if successful.
 */
exports.deleteAvailableCopy = async function (bookId, memberId) {
    try {
        // 1. Find one available copy
        const available = await exports.query(
            `SELECT copy_id
             FROM bookcopies
             WHERE book_id = ? AND availability = TRUE
             LIMIT 1`,
            [bookId]
        );

        if (available.length === 0) {
            return { success: false, message: "No available copies to delete." };
        }

        const copyId = available[0].copy_id;

        // 2. Delete that specific copy
        await exports.query(
            `DELETE FROM fines WHERE transaction_id IN (SELECT transaction_id FROM borrowtransactions WHERE copy_id = ?)`,
            [copyId]
        );

        await exports.query(
            `DELETE FROM borrowtransactions WHERE copy_id = ?`,
            [copyId]
        );

        await exports.query(
            `DELETE FROM bookcopies WHERE copy_id = ?`,
            [copyId]
        );

        // 3. Log activity
        await exports.logAction(memberId, `Deleted copy ID ${copyId} for book ID ${bookId}`);

        return {
            success: true,
            message: `Copy ${copyId} of book ${bookId} deleted successfully.`,
            deletedCopyId: copyId
        };

    } catch (error) {
        console.error("Error deleting copy:", error);
        return { success: false, message: "Server error deleting copy." };
    }
};


// -----------------------------------------------------------------------------
// BORROW TRANSACTION FUNCTIONALITY
// -----------------------------------------------------------------------------

/**
 * Retrieves a borrow transaction record by its ID.
 * @param {number} transaction_id - The ID of the transaction.
 * @returns {Promise<Array<{transaction_id: number, member_id: number, copy_id: number, borrow_date: Date, due_date: Date, returned_date: Date|null, status: 'borrowed'|'returned'|'overdue'}>>} - The transaction record(s).
 */
exports.getTransactionById = function(transaction_id) {
    return exports.query(
        'SELECT * FROM borrowtransactions WHERE transaction_id = ?',
        [transaction_id]
    );
};

/**
 * Creates a new borrow transaction for a member and book.
 * Automatically finds an available copy and marks it unavailable.
 * @param {number} member_id - The ID of the member.
 * @param {number} book_id - The ID of the book to borrow.
 * @returns {Promise<{success: boolean}|{error: string}>} - Success status or error message.
 */
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

/**
 * Marks a transaction as returned, updates the copy status to available, and logs the action.
 * @param {number} transaction_id - The ID of the transaction to return.
 * @returns {Promise<{success: boolean}|{success: boolean, error: string}>} - Success status or error message.
 */
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


// -----------------------------------------------------------------------------
// FINES FUNCTIONALITY
// -----------------------------------------------------------------------------

/**
 * Creates a one-time fine for an overdue transaction if one does not already exist, and sets the transaction status to 'overdue'.
 * @param {number} transactionId - The ID of the transaction.
 * @param {number} memberId - The ID of the member (for logging).
 * @returns {Promise<void>}
 */
exports.createFine = async function(transactionId, memberId) {
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


    //log activity
    await exports.logAction(memberId, `Added fine for overdue return, transaction ID ${transactionId}`);
};

/**
 * Checks a member's transactions for those that are overdue and have no fine recorded, then applies a fine to each.
 * @param {number} memberId - The ID of the member.
 * @returns {Promise<void>}
 */
exports.checkAndApplyFines = async function(memberId) {
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

/**
 * Marks all unpaid fines for a given member as paid.
 * @param {number} memberId - The ID of the member.
 * @returns {Promise<void>}
 */
exports.payFines = async function(memberId) {
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


// -----------------------------------------------------------------------------
// RESERVE FUNCTIONALITY
// -----------------------------------------------------------------------------
/**
 * Gets the next reserver for a given book.
 * @param {number} bookId - The ID of the book.
 * @returns {Promise<Object|null>} The reservation info of the next reserver, or null if no one has reserved the book.
 */
exports.getNextReserverForBook = async (bookId) => {
  const rows = await exports.query(
    `SELECT r.reservation_id, r.member_id, r.reservation_date, m.name AS member_name
     FROM reservations r
     JOIN members m ON r.member_id = m.member_id
     WHERE r.book_id = ?
     ORDER BY r.reservation_date ASC, r.reservation_id ASC
     LIMIT 1`,
    [bookId]
  );

  return rows.length > 0 ? rows[0] : null;
};

/**
 * Attempts to give a book to the next reserver.
 * @param {number} bookId - The ID of the book.
 * @returns {Promise<Object>} An object containing success, message, and member_id.
 *   - success: true if the book was given to the next reserver, false otherwise.
 *   - message: A message indicating the result of the operation.
 *   - member_id: The ID of the next reserver, if successful.
 */
exports.giveBookToNextReserver = async function(bookId) {
  try {
    // Get the next reserver
    const nextReserver = await exports.getNextReserverForBook(bookId);
    if (!nextReserver) {
      return { success: false, error: "No one has reserved this book yet." };
    }

    // Attempt to give the book
    const result = await exports.createTransaction(nextReserver.member_id, bookId);
    if (result.error) {
      return { success: false, error: `Could not give book to next reserver: ${result.error}` };
    }

    // Delete the reservation now that the book is given
    await exports.query(
      'DELETE FROM reservations WHERE reservation_id = ?',
      [nextReserver.reservation_id]
    );

    //log activity
    await exports.logAction(nextReserver.member_id, `Received book ${bookId} to as its next reserver.`);

    return {
      success: true,
      member_id: nextReserver.member_id,
      message: `Book given to next reserver, member_id ${nextReserver.member_id}`
    };

  } catch (err) {
    return { success: false, error: `Server error: ${err.message}` };
  }
};
