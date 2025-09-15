const { pool } = require('./config/database');

async function testPostRetrieval() {
  try {
    console.log('Testing post endpoint...');
    
    // 1. First get a valid slug from the database
    console.log('Fetching a post slug from the database...');
    const [allPosts] = await pool.execute('SELECT id, slug FROM posts LIMIT 1');
    
    if (allPosts.length === 0) {
      console.log('No posts found in database');
      return;
    }
    
    const testPost = allPosts[0];
    console.log(`Found post with ID ${testPost.id} and slug "${testPost.slug}"`);
    
    // 2. Try to get the full post details using that slug
    console.log(`Fetching full post details for slug "${testPost.slug}"...`);
    try {
      const [posts] = await pool.execute(`
        SELECT 
          p.*, u.username as author_name
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.slug = ?
      `, [testPost.slug]);
      
      console.log(`Found ${posts.length} posts with slug "${testPost.slug}"`);
      
      if (posts.length === 0) {
        console.log('Post not found with this slug');
        return;
      }
      
      const post = posts[0];
      console.log('Post basic details:', {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status
      });
      
      // 3. Try to get categories
      try {
        console.log('Fetching categories...');
        const [categories] = await pool.execute(`
          SELECT c.id, c.name, c.slug, c.description
          FROM categories c
          INNER JOIN post_categories pc ON c.id = pc.category_id
          WHERE pc.post_id = ?
        `, [post.id]);
        console.log(`Found ${categories.length} categories`);
      } catch (error) {
        console.error('Error fetching categories:', error.message);
      }
      
      // 4. Try to get tags
      try {
        console.log('Fetching tags...');
        const [tags] = await pool.execute(`
          SELECT t.id, t.name, t.slug
          FROM tags t
          INNER JOIN post_tags pt ON t.id = pt.tag_id
          WHERE pt.post_id = ?
        `, [post.id]);
        console.log(`Found ${tags.length} tags`);
      } catch (error) {
        console.error('Error fetching tags:', error.message);
      }
      
      // 5. Try to get files - this might be the issue
      try {
        console.log('Fetching files...');
        const [files] = await pool.execute(`
          SELECT id, filename, original_name, file_path, file_size, mime_type, 
                 description, is_public, download_count, created_at, updated_at
          FROM files
          WHERE post_id = ?
        `, [post.id]);
        console.log(`Found ${files.length} files`);
        
        if (files.length > 0) {
          console.log('First file:', files[0]);
        }
      } catch (error) {
        console.error('Error fetching files:', error.message);
      }
      
    } catch (error) {
      console.error('Error fetching post details:', error.message);
    }
    
  } catch (error) {
    console.error('Error in test script:', error);
  } finally {
    process.exit(0);
  }
}

testPostRetrieval();