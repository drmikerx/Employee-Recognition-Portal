DROP database capstone;

Create database capstone;

use capstone;
-- -----------------------------------------------------
-- Drop tables if they exist
-- -----------------------------------------------------

DROP TABLE IF EXISTS `awards`;
DROP TABLE IF EXISTS `award_types`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

-- -----------------------------------------------------
-- Table `roles`
-- -----------------------------------------------------
CREATE TABLE `roles` (
`id` INT(11) NOT NULL AUTO_INCREMENT,
`role` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`));

-- -----------------------------------------------------
-- Table `award_types`
-- -----------------------------------------------------
CREATE TABLE `award_types` (
`id` INT(11) NOT NULL AUTO_INCREMENT,
`award_type` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`));


-- -----------------------------------------------------
-- Table `user`
-- -----------------------------------------------------
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_name` VARCHAR(100) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `role_id` int NOT NULL,
  `date_created` DATETIME NULL DEFAULT NULL,
  `signature_path` VARCHAR(256) NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `user_role`
    FOREIGN KEY (`role_id`)
    REFERENCES `roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
  
  
  -- -----------------------------------------------------
-- Table `awards`
-- -----------------------------------------------------
CREATE TABLE `awards` (
`id` INT(11) NOT NULL AUTO_INCREMENT,
`user_id` int NOT NULL,
`award_type_id` int NOT NULL,
`recipient` VARCHAR(100) NOT NULL,
`recipient_email` VARCHAR(100) NOT NULL,
`award_date` DATETIME NULL DEFAULT NULL,
`award_create_date` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `award_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `award_type`
    FOREIGN KEY (`award_type_id`)
    REFERENCES `award_types` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
    
    
-- Seed Data
-- Roles
INSERT INTO roles (role) Values('admin');
INSERT INTO roles (role) Values('general');
-- Award Types
INSERT INTO award_types (award_type) Values('Employee of the Month');
INSERT INTO award_types (award_type) Values('Employee of the Week');
-- Users
INSERT INTO users (user_name, password, email, role_id, date_created) Values('eric', 'tempPass1', 'fake@fakeemail.com', 1, NOW());
INSERT INTO users (user_name, password, email, role_id, date_created) Values('michael', 'tempPass2', 'fake1@fakeemail.com', 1, NOW());
INSERT INTO users (user_name, password, email, role_id, date_created) Values('kevin', 'tempPass3', 'fake2@fakeemail.com', 2, NOW());
-- Awards
INSERT INTO awards (user_id, award_type_id, recipient, recipient_email, award_date, award_create_date) Values(1, 1, 'Test User 1', 'testUser1@fakeEmail.com', NOW() - interval 1 day, NOW());
INSERT INTO awards (user_id, award_type_id, recipient, recipient_email, award_date, award_create_date) Values(2, 2, 'Test User 2', 'testUser2@fakeEmail.com', NOW() - interval 1 day, NOW());
INSERT INTO awards (user_id, award_type_id, recipient, recipient_email, award_date, award_create_date) Values(3, 2, 'Test User 3', 'testUser3@fakeEmail.com', NOW() - interval 1 day, NOW());
INSERT INTO awards (user_id, award_type_id, recipient, recipient_email, award_date, award_create_date) Values(1, 1, 'Test User 4', 'testUser4@fakeEmail.com', NOW() - interval 1 day, NOW());
