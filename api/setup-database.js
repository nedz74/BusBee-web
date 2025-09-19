const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    console.log('🚀 Setting up BusBee database...\n');

    // Create connection pool
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        // Test connection
        console.log('📡 Testing database connection...');
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully at:', result.rows[0].now);

        // Read and execute schema file
        console.log('\n📋 Creating database schema...');
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        
        if (!fs.existsSync(schemaPath)) {
            throw new Error('Schema file not found at: ' + schemaPath);
        }

        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('✅ Database schema created successfully');

        // Check tables
        console.log('\n📊 Verifying created tables...');
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        const tables = tablesResult.rows.map(row => row.table_name);
        console.log('📋 Created tables:', tables.join(', '));

        // Check sample data
        console.log('\n👥 Checking sample data...');
        const usersResult = await pool.query('SELECT COUNT(*) FROM users');
        const routesResult = await pool.query('SELECT COUNT(*) FROM routes');
        
        console.log(`✅ Sample users: ${usersResult.rows[0].count}`);
        console.log(`✅ Sample routes: ${routesResult.rows[0].count}`);

        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📱 You can now start the API server with: npm run dev');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Troubleshooting tips:');
            console.log('   1. Make sure PostgreSQL is running');
            console.log('   2. Check your database credentials in .env file');
            console.log('   3. Ensure the database "busbee_db" exists');
        }
        
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run setup
setupDatabase();
