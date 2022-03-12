/**
 * Fix to force the process environment overriding before requiring the server file 
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mongodb://localhost:27017/miniapi-test';
process.env.DEBUG = ""