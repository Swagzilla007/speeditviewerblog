const mysql = require('mysql2/promise');

// Database configuration (same as in your .env file)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // XAMPP default has no password
  database: 'blog_management',
  port: 3306
};

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    console.log('Database config:', { ...dbConfig, password: '***' });
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully!');
    
    // Test query to check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // Test query to check admin user
    const [users] = await connection.execute('SELECT username, email, role FROM users WHERE role = "admin"');
    console.log('👤 Admin users:');
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - ${user.role}`);
    });
    
    // Test query to check categories
    const [categories] = await connection.execute('SELECT name, slug FROM categories');
    console.log('📂 Categories:');
    categories.forEach(category => {
      console.log(`  - ${category.name} (${category.slug})`);
    });
    
    await connection.end();
    console.log('✅ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure XAMPP MySQL service is running');
    console.log('2. Check if database "blog_management" exists');
    console.log('3. Verify username/password in .env file');
    console.log('4. Try connecting via phpMyAdmin first');
  }
}

testConnection(); 