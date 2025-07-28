-- Create database if not exists
CREATE DATABASE IF NOT EXISTS blog_management;
USE blog_management;

-- Users table (for admin authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    featured_image VARCHAR(255),
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    author_id INT NOT NULL,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Post Categories (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS post_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_category (post_id, category_id)
);

-- Post Tags (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS post_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_tag (post_id, tag_id)
);

-- Files table (for downloadable files)
CREATE TABLE IF NOT EXISTS files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    post_id INT,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Download Requests table
CREATE TABLE IF NOT EXISTS download_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    file_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_date TIMESTAMP NULL,
    approved_by INT NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default admin user (password: gayathra123)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'wkgayathra@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin')
ON DUPLICATE KEY UPDATE username=username;

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES 
('Frontend Development', 'frontend-development', 'Frontend web development tutorials and guides'),
('Backend Development', 'backend-development', 'Backend development with Node.js, PHP, Python, etc.'),
('Database & SQL', 'database-sql', 'Database design, SQL queries, and data management'),
('Web Design & UI/UX', 'web-design-ui-ux', 'Web design principles, UI/UX best practices'),
('DevOps & Deployment', 'devops-deployment', 'Server setup, deployment, and DevOps practices'),
('Programming Languages', 'programming-languages', 'JavaScript, Python, PHP, and other programming languages'),
('Frameworks & Libraries', 'frameworks-libraries', 'React, Next.js, Express, and other frameworks'),
('Tools & Resources', 'tools-resources', 'Development tools, APIs, and useful resources')
ON DUPLICATE KEY UPDATE name=name;

-- Insert default tags
INSERT INTO tags (name, slug) VALUES 
('javascript', 'javascript'),
('react', 'react'),
('nodejs', 'nodejs'),
('mysql', 'mysql'),
('nextjs', 'nextjs'),
('html', 'html'),
('css', 'css'),
('php', 'php'),
('python', 'python'),
('express', 'express'),
('mongodb', 'mongodb'),
('git', 'git'),
('docker', 'docker'),
('aws', 'aws'),
('api', 'api'),
('responsive-design', 'responsive-design'),
('seo', 'seo'),
('performance', 'performance'),
('security', 'security'),
('testing', 'testing'),
('web-development', 'web-development'),
('programming', 'programming'),
('tutorial', 'tutorial'),
('beginners', 'beginners'),
('advanced', 'advanced')
ON DUPLICATE KEY UPDATE name=name;

-- Create indexes for better performance
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_published ON posts(published_at);
CREATE INDEX idx_post_categories_post ON post_categories(post_id);
CREATE INDEX idx_post_categories_category ON post_categories(category_id);
CREATE INDEX idx_post_tags_post ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);
CREATE INDEX idx_files_post ON files(post_id);
CREATE INDEX idx_download_requests_user ON download_requests(user_id);
CREATE INDEX idx_download_requests_file ON download_requests(file_id);
CREATE INDEX idx_download_requests_status ON download_requests(status); 