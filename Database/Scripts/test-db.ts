// test-db-connection.js
import {connectToDatabase} from '../mongoose.js'; // adjust path as needed
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
    console.log('🧪 Testing MongoDB connection...\n');

    try {
        // Test 1: Initial connection
        console.log('Test 1: Initial connection');
        const conn1 = await connectToDatabase();
        console.log('✅ Connected successfully');
        console.log(`   Connection state: ${conn1.connection.readyState}`);
        console.log(`   Database name: ${conn1.connection.db?.databaseName}\n`);

        // Test 2: Cached connection (should reuse)
        console.log('Test 2: Cached connection');
        const conn2 = await connectToDatabase();
        console.log('✅ Retrieved cached connection');
        console.log(`   Same instance: ${conn1 === conn2}\n`);

        // Test 3: Check connection details
        console.log('Test 3: Connection details');
        console.log(`   Host: ${conn1.connection.host}`);
        console.log(`   Port: ${conn1.connection.port}`);
        console.log(`   Ready state: ${conn1.connection.readyState} (1 = connected)\n`);

        // Clean up
        await conn1.connection.close();
        console.log('✅ Connection closed successfully');
        console.log('\n🎉 All tests passed!');

    } catch (error: any) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testConnection();