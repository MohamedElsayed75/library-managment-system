-- MEMBERS TABLE
CREATE TABLE members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    membership_date DATE NOT NULL,
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
    isbn VARCHAR(20) UNIQUE,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    language VARCHAR(50),
    publication_year INT,
    FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id)
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
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    returned_date DATE,
    status ENUM('borrowed','returned','overdue') DEFAULT 'borrowed',
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (copy_id) REFERENCES bookcopies(copy_id)
);

-- RESERVATIONS TABLE
CREATE TABLE reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    book_id INT NOT NULL,
    reservation_date DATE NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);

-- FINES TABLE
CREATE TABLE fines (
    fine_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date_issued DATE NOT NULL,
    payment_status BOOLEAN DEFAULT FALSE,
    payment_date DATE,
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

-- BOOK-AUTHOR JUNCTION TABLE
CREATE TABLE bookauthor (
    book_id INT NOT NULL,
    author_id INT NOT NULL,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    FOREIGN KEY (author_id) REFERENCES author(author_id)
);
