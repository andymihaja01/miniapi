const mongoose = require("mongoose")
exports.mochaHooks = {
    /*
    * WARNING:  USE SEPARATE DB FOR TESTS
    * drop the test database first to ensure the tests starts with fresh data
    */
    beforeAll(done) {
        mongoose.connection.on('open', function(){
            mongoose.connection.db.dropDatabase(function(err, result){
                done();
            });
        });
        
    },
    afterAll(done)  {
        console.log("AFTER ALL")
        //connection needs to be closed to avoid mocha hanging on
        mongoose.connection.close(done);
    }
  };