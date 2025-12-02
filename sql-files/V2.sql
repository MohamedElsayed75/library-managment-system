-- CREATE database librarydb

-- CREATE TABLE `members` (
--   `member_id` integer AUTO_INCREMENT KEY,
--   `name` text,
--   `email` text,
--   `password` text,
--   `address` text,
--   `membership_date` date,
--   `is_admin` boolean
-- );

-- CREATE TABLE `author` (
--   `author_id` integer PRIMARY KEY,
--   `name` text
-- );

-- CREATE TABLE `publishers` (
--   `publisher_id` integer PRIMARY KEY,
--   `name` text
-- );

-- CREATE TABLE `books` (
--   `book_id` integer PRIMARY KEY,
--   `publisher_id` integer,
--   `isbn` integer,
--   `title` text,
--   `genre` text,
--   `language` text,
--   `publication_year` int
-- );

-- CREATE TABLE `bookcopies` (
--   `copy_id` integer PRIMARY KEY,
--   `book_id` integer,
--   `availability` boolean
-- );

-- CREATE TABLE `borrowtransactions` (
--   `transaction_id` integer PRIMARY KEY,
--   `member_id` integer,
--   `copy_id` integer,
--   `borrow_date` date,
--   `due_date` date,
--   `returned_date` date,
--   `status` text
-- );

-- CREATE TABLE `reservations` (
--   `reservation_id` integer PRIMARY KEY,
--   `member_id` integer,
--   `book_id` integer,
--   `reservation_date` date
-- );

-- CREATE TABLE `fines` (
--   `fine_id` integer PRIMARY KEY,
--   `transaction_id` integer,
--   `amount` integer,
--   `date_issued` date,
--   `payment_status` boolean,
--   `payment_date` date NULL
-- );

-- CREATE TABLE `activitylogs` (
--   `log_id` integer PRIMARY KEY,
--   `member_id` integer,
--   `action` text,
--   `timestamp` datetime
-- );

-- CREATE TABLE `bookauthor` (
--   `book_id` integer,
--   `author_id` integer
-- );

-- ALTER TABLE `books` ADD FOREIGN KEY (`publisher_id`) REFERENCES `publishers` (`publisher_id`);

-- ALTER TABLE `bookcopies` ADD FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

-- ALTER TABLE `borrowtransactions` ADD FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`);

-- ALTER TABLE `borrowtransactions` ADD FOREIGN KEY (`copy_id`) REFERENCES `bookcopies` (`copy_id`);

-- ALTER TABLE `reservations` ADD FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`);

-- ALTER TABLE `reservations` ADD FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

-- ALTER TABLE `fines` ADD FOREIGN KEY (`transaction_id`) REFERENCES `borrowtransactions` (`transaction_id`);

-- ALTER TABLE `activitylogs` ADD FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`);

-- ALTER TABLE `bookauthor` ADD FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

-- ALTER TABLE `bookauthor` ADD FOREIGN KEY (`author_id`) REFERENCES `author` (`author_id`);

-- ALTER TABLE books
-- MODIFY isbn VARCHAR(20);



INSERT INTO publishers (publisher_id, name) VALUES
(1, 'Bloomsbury'),
(2, 'Penguin Random House'),
(3, 'HarperCollins'),
(4, 'Bantam Books'),
(5, 'Independent Publisher');


INSERT INTO books (book_id, publisher_id, isbn, title, genre, language, publication_year) VALUES
(1, 1, 9780439554930, 'Harry Potter and the Sorcerer''s Stone', 'Fantasy', 'English', 1997),
(2, 2, 9780261103573, 'The Lord of the Rings: The Fellowship of the Ring', 'Fantasy', 'English', 1954),
(3, 3, 9780307474278, 'The Girl with the Dragon Tattoo', 'Crime Thriller', 'English', 2005),
(4, 1, 9780061120084, 'To Kill a Mockingbird', 'Fiction', 'English', 1960),
(5, 4, 9780553386790, 'A Game of Thrones', 'Fantasy', 'English', 1996),
(6, 2, 9780439023528, 'The Hunger Games', 'Dystopian', 'English', 2008),
(7, 5, 9780143127741, 'Sapiens: A Brief History of Humankind', 'History', 'English', 2011),
(8, 3, 9781982137274, 'The Silent Patient', 'Psychological Thriller', 'English', 2019),
(9, 4, 9780747538493, 'Harry Potter and the Chamber of Secrets', 'Fantasy', 'English', 1998),
(10, 5, 9780000000001, 'Shadow Slave', 'Fantasy / LitRPG', 'English', 2021);


-- Insert some authors
INSERT INTO author (author_id, name) VALUES
(1, 'J.K. Rowling'),
(2, 'J.R.R. Tolkien'),
(3, 'Stieg Larsson'),
(4, 'Harper Lee'),
(5, 'George R.R. Martin'),
(6, 'Suzanne Collins'),
(7, 'Yuval Noah Harari'),
(8, 'Alex Michaelides'),
(9, 'Guiltythree');

-- Link authors to books
INSERT INTO bookauthor (book_id, author_id) VALUES
(1, 1),  -- Harry Potter - J.K. Rowling
(2, 2),  -- LOTR - Tolkien
(3, 3),  -- Dragon Tattoo - Larsson
(4, 4),  -- Mockingbird - Harper Lee
(5, 5),  -- Game of Thrones - Martin
(6, 6),  -- Hunger Games - Collins
(7, 7),  -- Sapiens - Harari
(8, 8),  -- Silent Patient - Michaelides
(9, 1),  -- Harry Potter 2 - Rowling
(10, 9); -- Shadow Slave - Guiltythree

-- Add some book copies
INSERT INTO bookcopies (copy_id, book_id, availability) VALUES
(1, 1, 1), (2, 1, 0), (3, 1, 1),  -- 2 available, 1 unavailable for Harry Potter
(4, 2, 1), (5, 2, 1),              -- 2 available for LOTR
(6, 3, 0),                          -- 0 available for Dragon Tattoo
(7, 4, 1), (8, 4, 1), (9, 4, 1),   -- 3 available for Mockingbird
(10, 5, 1),                         -- 1 available for Game of Thrones
(11, 6, 1), (12, 6, 0),            -- 1 available for Hunger Games
(13, 7, 1),                         -- 1 available for Sapiens
(14, 8, 0),                         -- 0 available for Silent Patient
(15, 9, 1),                         -- 1 available for Harry Potter 2
(16, 10, 1), (17, 10, 1), (18, 10, 1); -- 3 available for Shadow Slave

-- SELECT 
--     b.book_id,
--     b.title,
--     b.isbn,
--     b.genre,
--     b.language,
--     b.publication_year,
--     p.name AS publisher_name,
--     GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS author_names,
--     COUNT(DISTINCT bc.copy_id) AS total_copies,
--     SUM(CASE WHEN bc.availability = 1 THEN 1 ELSE 0 END) AS available_copies
-- FROM books b
-- LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
-- LEFT JOIN bookauthor ba ON b.book_id = ba.book_id
-- LEFT JOIN author a ON ba.author_id = a.author_id
-- LEFT JOIN bookcopies bc ON b.book_id = bc.book_id
-- GROUP BY b.book_id, b.title, b.isbn, b.genre, b.language, b.publication_year, p.name
-- ORDER BY b.book_id;