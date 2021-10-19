const mongoose = require('monogoose')
const Schema = mongoose.Schema

// create user Schema 
const User = new Schema({
    username: String,
    password: String,
    admin: {
        type: Boolean,
        default: false
    }
})


// create new User document
User.statics.create = function (username, password) {
    const user = new this({
        username,
        password
    })

    // return the Promise
    return user.save()
}

// find one user by usingusername 
User.statics.findOneByUsername = function (username) {
    return this.findOne({
        username
    }).exec()
}


// verify the password of the User documment
User.methods.verify = function (password) {
    return this.password === password
}

// assign admin 
User.methods.assignAdmin = function () {
    this.admin = true
    return this.save()
}


module.exports = mongoose.model('User', User)