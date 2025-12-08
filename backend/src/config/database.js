const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config();

/**
 * TypeORM DataSource Configuration
 * Connects to PostgreSQL database with all entities
 */
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'user',
  database: process.env.DATABASE_NAME || 'memorylayer',
  
  // Entity configuration
  entities: [path.join(__dirname, '..', 'entities', '*.js')],
  
  // Migration configuration
  migrations: [path.join(__dirname, '..', 'migrations', '*.js')],
  
  // Development settings
  synchronize: process.env.NODE_ENV === 'development', // Auto-sync schema in dev
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
  
  // Connection pool settings for production
  extra: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

/**
 * Initialize database connection
 * @returns {Promise<DataSource>}
 */
const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
    return AppDataSource;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

module.exports = { AppDataSource, initializeDatabase };
