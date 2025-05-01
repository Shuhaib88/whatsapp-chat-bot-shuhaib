const bcrypt = require('bcrypt');

bcrypt.hash('Urbanzi@123', 10, function(err, hash) {
    console.log(hash); // Save this into user-cred.json
});
