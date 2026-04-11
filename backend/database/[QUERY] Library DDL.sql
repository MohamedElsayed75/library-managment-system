-- MEMBERS TABLE
CREATE TABLE members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    membership_date DATETIME NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

-- AUTHORS TABLE
CREATE TABLE author (
    author_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- PUBLISHERS TABLE
CREATE TABLE publishers (
    publisher_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- BOOKS TABLE
CREATE TABLE books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    publisher_id INT,
    author_id INT NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    language VARCHAR(50),
    publication_year INT,
    FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id),
    FOREIGN KEY (author_id) REFERENCES author(author_id)
);

-- BOOK COPIES TABLE
CREATE TABLE bookcopies (
    copy_id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    availability BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);

-- BORROW TRANSACTIONS TABLE
CREATE TABLE borrowtransactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    copy_id INT NOT NULL,
    borrow_date DATETIME NOT NULL,
    due_date DATETIME NOT NULL,
    returned_date DATETIME,
    status ENUM('borrowed','returned','overdue') DEFAULT 'borrowed',
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (copy_id) REFERENCES bookcopies(copy_id)
);

-- RESERVATIONS TABLE
CREATE TABLE reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    book_id INT NOT NULL,
    reservation_date DATETIME NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);

-- FINES TABLE
CREATE TABLE fines (
    fine_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date_issued DATETIME NOT NULL,
    payment_status BOOLEAN DEFAULT FALSE,
    payment_date DATETIME,
    FOREIGN KEY (transaction_id) REFERENCES borrowtransactions(transaction_id)
);

-- ACTIVITY LOGS TABLE
CREATE TABLE activitylogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- VIEW
CREATE OR REPLACE VIEW view_books_full AS
SELECT 
    b.book_id,
    b.title,
    b.isbn,
    b.genre,
    b.language,
    b.publication_year,

    p.name AS publisher_name,
    a.name AS author_name,

    -- Count only available copies
    COUNT(CASE WHEN bc.availability = 1 THEN bc.copy_id END) AS copy_count

FROM books b

LEFT JOIN publishers p 
    ON b.publisher_id = p.publisher_id

LEFT JOIN author a
    ON b.author_id = a.author_id

LEFT JOIN bookcopies bc 
    ON b.book_id = bc.book_id

GROUP BY 
    b.book_id, b.title, b.isbn, b.genre, b.language, 
    b.publication_year, p.name, a.name

ORDER BY b.title;