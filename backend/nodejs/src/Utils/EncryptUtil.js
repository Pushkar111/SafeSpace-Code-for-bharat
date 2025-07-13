// npm install bcrypt

const bcrypt = require("bcrypt")

const encryptPassword = (plainPassword)=> {
    const salt = bcrypt.genSaltSync(12); // by default salt 12 ---> rounds - 12 ----> used for enhanced the security
    const hashPassword = bcrypt.hashSync(plainPassword, salt);

    return hashPassword;
}

const comparePassword = (plainPassword, hashPassword) => {
    
    const isMatch = bcrypt.compareSync(plainPassword, hashPassword);
    if(isMatch) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    encryptPassword,
    comparePassword
}






/*
- genSaltSync()
- hashSync() ----> used to convert plainPassword to hashedPassword

- compareSync(plainPassword, hashPassword) ---> return true or false 

*/