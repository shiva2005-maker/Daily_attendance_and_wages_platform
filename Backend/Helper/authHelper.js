const bcrypt = require('bcrypt');

module.exports.hashedPasword = async(password)=>{
    return hashedPassword = await bcrypt.hash(password,10);

}

module.exports.comparepassword = async (password,hashedpassword)=>{
    return await bcrypt.compare(password,hashedpassword)
}