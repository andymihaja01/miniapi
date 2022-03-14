/**
 * Fix to force the process environment overriding before requiring the server file 
 */
process.env.NODE_ENV = 'test';
process.env.DEBUG = ""
require("#root/testHelpers/connect.js")
