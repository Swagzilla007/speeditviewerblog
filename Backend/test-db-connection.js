const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'blog_management',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Database connection successful!');

    // Test basic queries
    const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    const [tags] = await connection.execute('SELECT COUNT(*) as count FROM tags');
    const [posts] = await connection.execute('SELECT COUNT(*) as count FROM posts');
    const [files] = await connection.execute('SELECT COUNT(*) as count FROM files');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');

    console.log('📊 Current database counts:');
    console.log(`   Categories: ${categories[0].count}`);
    console.log(`   Tags: ${tags[0].count}`);
    console.log(`   Posts: ${posts[0].count}`);
    console.log(`   Files: ${files[0].count}`);
    console.log(`   Users: ${users[0].count}`);

    // Add sample data if database is empty
    if (categories[0].count === 0) {
      console.log('📝 Adding sample categories...');
      await connection.execute("INSERT INTO categories (name, slug, description) VALUES ('Technology', 'technology', 'Tech-related posts')");
      await connection.execute("INSERT INTO categories (name, slug, description) VALUES ('Lifestyle', 'lifestyle', 'Lifestyle and personal posts')");
      await connection.execute("INSERT INTO categories (name, slug, description) VALUES ('Business', 'business', 'Business and entrepreneurship')");
    }

    if (tags[0].count === 0) {
      console.log('📝 Adding sample tags...');
      await connection.execute("INSERT INTO tags (name, slug) VALUES ('javascript', 'javascript')");
      await connection.execute("INSERT INTO tags (name, slug) VALUES ('react', 'react')");
      await connection.execute("INSERT INTO tags (name, slug) VALUES ('nodejs', 'nodejs')");
      await connection.execute("INSERT INTO tags (name, slug) VALUES ('web-development', 'web-development')");
    }

    if (posts[0].count === 0) {
      console.log('📝 Adding sample posts...');
      await connection.execute(`
        INSERT INTO posts (title, slug, content, excerpt, status, author_id, published_at) 
        VALUES ('Welcome to Our Blog', 'welcome-to-our-blog', 'This is our first blog post content...', 'Welcome to our new blog!', 'published', 1, NOW())
      `);
      await connection.execute(`
        INSERT INTO posts (title, slug, content, excerpt, status, author_id, published_at) 
        VALUES ('Getting Started with React', 'getting-started-with-react', 'React is a powerful JavaScript library...', 'Learn the basics of React development', 'published', 1, NOW())
      `);
    }

    console.log('✅ Database test completed successfully!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection(); 