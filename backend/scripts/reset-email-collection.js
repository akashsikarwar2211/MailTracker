const { MongoClient } = require('mongodb');

async function resetEmailCollection() {
  // Use your Atlas connection string from .env file
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable not found!');
    console.log('💡 Please set your Atlas connection string in the .env file');
    console.log('   Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inspmail');
    process.exit(1);
  }
  
  const client = new MongoClient(uri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    // Extract database name from URI or use default
    const dbName = uri.includes('/') ? uri.split('/').pop().split('?')[0] : 'inspmail';
    const db = client.db(dbName);
    const collection = db.collection('emails');
    
    console.log(`📁 Using database: ${dbName}`);

    // Check if collection exists and get count
    const collections = await db.listCollections({ name: 'emails' }).toArray();
    if (collections.length > 0) {
      const count = await collection.countDocuments();
      console.log(`📊 Found ${count} documents in emails collection`);
      
      console.log('🗑️ Dropping emails collection...');
      await collection.drop();
      console.log('✅ Emails collection dropped successfully');
    } else {
      console.log('ℹ️ Emails collection does not exist');
    }

    console.log('🎉 Collection reset complete!');
    console.log('📝 The collection will be automatically recreated when new emails are added.');

  } catch (error) {
    console.error('❌ Error resetting collection:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
resetEmailCollection();
