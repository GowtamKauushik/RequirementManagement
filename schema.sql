-- Database Schema for Customer Requirement Management System

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    assigned_user_id BIGINT,
    created_date DATE,
    FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS requirements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50),
    status VARCHAR(50),
    due_date DATE,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Requirement Status Timeline Table
CREATE TABLE IF NOT EXISTS requirement_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requirement_id BIGINT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    remarks TEXT,
    changed_by_id BIGINT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requirement_id) REFERENCES requirements(id),
    FOREIGN KEY (changed_by_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS inventory_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255),
    product VARCHAR(255),
    variant VARCHAR(255),
    quantity INT,
    price DECIMAL(10,2),
    stock_status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS coupon_collection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    coupon_available BOOLEAN,
    coupon_number VARCHAR(255),
    coupon_value DECIMAL(10,2),
    product_value DECIMAL(10,2),
    additional_amount DECIMAL(10,2),
    collected_amount DECIMAL(10,2),
    collected_by_id BIGINT NOT NULL,
    collection_date DATE,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (collected_by_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_trail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id BIGINT,
    old_value TEXT,
    new_value TEXT,
    performed_by_id BIGINT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(255),
    FOREIGN KEY (performed_by_id) REFERENCES users(id)
);
