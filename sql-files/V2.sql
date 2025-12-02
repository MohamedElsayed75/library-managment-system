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

INSERT INTO publishers (publisher_id, name) VALUES
(1, 'Bloomsbury'),
(2, 'Penguin Random House'),
(3, 'HarperCollins'),
(4, 'Bantam Books'),
(5, 'Independent Publisher');

INSERT INTO books (book_id, publisher_id, isbn, title, genre, language, publication_year) VALUES
(1, 1, '9780439554930', 'Harry Potter and the Sorcerer''s Stone', 'Fantasy', 'English', 1997),
(2, 2, '9780261103573', 'The Lord of the Rings: The Fellowship of the Ring', 'Fantasy', 'English', 1954),
(3, 3, '9780307474278', 'The Girl with the Dragon Tattoo', 'Crime Thriller', 'English', 2005),
(4, 1, '9780061120084', 'To Kill a Mockingbird', 'Fiction', 'English', 1960),
(5, 4, '9780553386790', 'A Game of Thrones', 'Fantasy', 'English', 1996),
(6, 2, '9780439023528', 'The Hunger Games', 'Dystopian', 'English', 2008),
(7, 5, '9780143127741', 'Sapiens: A Brief History of Humankind', 'History', 'English', 2011),
(8, 3, '9781982137274', 'The Silent Patient', 'Psychological Thriller', 'English', 2019),
(9, 4, '9780747538493', 'Harry Potter and the Chamber of Secrets', 'Fantasy', 'English', 1998),
(10, 5, '9780000000001', 'Shadow Slave', 'Fantasy / LitRPG', 'English', 2021);




