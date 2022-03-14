/**
 * Fix to force the process environment overriding before requiring the server file 
 */
require("#root/testHelpers/connect.js")
process.env.NODE_ENV = 'test';
process.env.DEBUG = ""
