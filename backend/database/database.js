import mysql from 'mysql2/promise';

////// -----------------------------------------------------------------------------
////// 1. CONFIGURATION
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
////// 2. QUERY HELPER
////// -----------------------------------------------------------------------------
export async function query(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

////// -----------------------------------------------------------------------------
////// 3. VIEW FUNCTIONS
////// -----------------------------------------------------------------------------
export const getAvailableBooks = () =>
    query("SELECT * FROM view_available_books");

export const getUnavailableBooks = () =>
    query("SELECT * FROM view_unavailable_books");

export const getActivityLast24h = () =>
    query("SELECT * FROM view_activity_last_24h");

export const getActivityLastWeek = () =>
    query("SELECT * FROM view_activity_last_week");

export const getCurrentBorrowed = () =>
    query("SELECT * FROM view_current_borrowed");

export const getOverdueBooks = () =>
    query("SELECT * FROM view_overdue_books");

export const getPendingReservations = () =>
    query("SELECT * FROM view_pending_reservations");

export const getMembersUnpaidFines = () =>
    query("SELECT * FROM view_members_unpaid_fines");

export const getBooksWithAuthors = () =>
    query("SELECT * FROM view_books_with_authors");

export const getPopularBooks = () =>
    query("SELECT * FROM view_popular_books");

export const getBooksComplete = () =>
    query("SELECT * FROM view_books_complete");

////// -----------------------------------------------------------------------------
////// 4. CRUD FUNCTIONS WITH AUTOMATIC ACTIVITY LOGGING
////// -----------------------------------------------------------------------------
export async function logActivity(memberId, action) {
    return query(
        `INSERT INTO activitylogs (member_id, action) VALUES (?, ?)`,
        [memberId, action]
    );
}

// -------------------------------------------------
// ADD MEMBER
// -------------------------------------------------
export async function addMember(data) {
    const result = await query(
        `INSERT INTO members (name, email, password, address, membership_date)
         VALUES (?, ?, ?, ?, CURRENT_DATE())`,
        [data.name, data.email, data.password, data.address]
    );

    await logActivity(result.insertId, "Added new member");
    return result;
}

// -------------------------------------------------
// ADD BOOK
// -------------------------------------------------
export async function addBook(data, adminId) {
    const result = await query(
        `INSERT INTO books (publisher_id, isbn, title, genre, language, publication_year)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            data.publisher_id,
            data.isbn,
            data.title,
            data.genre,
            data.language,
            data.publication_year
        ]
    );

    await logActivity(adminId, `Added new book: ${data.title}`);
    return result;
}

// -------------------------------------------------
// ADD COPY TO BOOK
// -------------------------------------------------
export async function addBookCopy(bookId, adminId) {
    const result = await query(
        `INSERT INTO bookcopies (book_id, availability)
         VALUES (?, TRUE)`,
        [bookId]
    );

    await logActivity(adminId, `Added new copy for book_id ${bookId}`);
    return result;
}

// -------------------------------------------------
// ADD FINE
// -------------------------------------------------
export async function addFine(data, adminId) {
    const result = await query(
        `INSERT INTO fines (transaction_id, amount, date_issued, payment_status)
         VALUES (?, ?, CURRENT_DATE(), FALSE)`,
        [data.transaction_id, data.amount]
    );

    await logActivity(adminId, `Added fine to transaction ${data.transaction_id}`);
    return result;
}

// -------------------------------------------------
// ADD RESERVATION
// -------------------------------------------------
export async function addReservation(data) {
    const result = await query(
        `INSERT INTO reservations (member_id, book_id, reservation_date)
         VALUES (?, ?, CURRENT_DATE())`,
        [data.member_id, data.book_id]
    );

    await logActivity(data.member_id, `Reserved book_id ${data.book_id}`);
    return result;
}

// -------------------------------------------------
// ADD BORROW TRANSACTION
// -------------------------------------------------
export async function addBorrowTransaction(data) {
    const result = await query(
        `INSERT INTO borrowtransactions 
         (member_id, copy_id, borrow_date, due_date, status)
         VALUES (?, ?, CURRENT_DATE(), ?, 'borrowed')`,
        [data.member_id, data.copy_id, data.due_date]
    );

    // mark the copy as unavailable
    await query(
        `UPDATE bookcopies SET availability = FALSE WHERE copy_id = ?`,
        [data.copy_id]
    );

    await logActivity(data.member_id, `Borrowed copy_id ${data.copy_id}`);
    return result;
}

////// -----------------------------------------------------------------------------
////// 5. EXPORT POOL
////// -----------------------------------------------------------------------------
export { pool };