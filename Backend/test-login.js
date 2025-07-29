const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'blog_management',
  port: 3306
};

async function testLogin() {
  try {
    console.log('🔌 Testing login functionality...');
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully!');
    
    // Test 1: Check if admin user exists
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['wkgayathra@gmail.com']
    );
    
    if (users.length === 0) {
      console.log('❌ Admin user not found in database');
      return;
    }
    
    const user = users[0];
    console.log('✅ Admin user found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
    
    // Test 2: Test password verification
    const testPassword = 'gayathra123';
    const isValidPassword = await bcrypt.compare(testPassword, user.password);
    
    console.log('🔐 Password verification test:');
    console.log(`  - Test password: ${testPassword}`);
    console.log(`  - Stored hash: ${user.password}`);
    console.log(`  - Password valid: ${isValidPassword ? '✅ YES' : '❌ NO'}`);
    
    if (isValidPassword) {
      console.log('✅ Login should work with these credentials!');
    } else {
      console.log('❌ Password verification failed');
      
      // Test 3: Generate a new hash for the password
      console.log('🔄 Generating new hash for password...');
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log(`  - New hash: ${newHash}`);
      
      // Test 4: Verify the new hash
      const newHashValid = await bcrypt.compare(testPassword, newHash);
      console.log(`  - New hash valid: ${newHashValid ? '✅ YES' : '❌ NO'}`);
    }
    
    await connection.end();
    console.log('✅ Login test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin();