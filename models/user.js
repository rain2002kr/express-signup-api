/* =======================
    LOAD THE CONFIG
==========================*/
const log = (m) => console.log(m);
const clr = () => console.clear();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require('crypto')
const bcryptjs = require('bcryptjs');
const randomstring = require('randomstring');
const config = require('../config')



const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        index: true,
        unique: true,
    },
    email: {
        type: String,
        index: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    temp_password: {
        type: String,

    },
    temp_password_time: {
        type: String,
    },

    admin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

// create new User document
userSchema.statics.create = function (username, password, email) {
    // bcryptjs 
    const salt = bcryptjs.genSaltSync(10);
    const hash = bcryptjs.hashSync(password, salt);

    const user = new this({
        username,
        password: hash,
        email
    })

    // const encrypted = crypto.createHmac('sha1', config.secret)
    //     .update(password)
    //     .digest('base64')

    // const user = new this({
    //     username,
    //     password: encrypted
    // })
    // return the Promise
    return user.save()
}
// find one user by usingusername 
userSchema.statics.findOneByUsername = function (username) {
    return this.findOne({
        username
    }).exec()
}

// verify the password of the User documment
userSchema.methods.verify = function (password) {

    const encrypted = bcryptjs.compareSync(password, this.password)
    //console.log(encrypted)
    //console.log(this.password)

    // const encrypted = crypto.createHmac('sha1', config.secret)
    //     .update(password)
    //     .digest('base64')
    // 

    // 비밀번호가 맞다면 true 아니라면, false 
    return encrypted
}

userSchema.methods.assignAdmin = function () {
    this.admin = true
    return this.save()
}

userSchema.methods.checkPassword = function (oldpassword) {
    console.log(oldpassword)
    console.log(this.password)
    const encrypteds = bcryptjs.compareSync(oldpassword, this.password)
    console.log(`encrypteds : ${encrypteds}`)
    return encrypteds
}

userSchema.methods.changePassword = function (user, newPassword) {
    // 토큰 가지고 이미 유저 확인후 이기때문에 패스워드만 변경하면 됨. 
    // bcryptjs 
    user.password = generateBcrpt(newPassword)
    return this.save()
}

// 삭제 한개
userSchema.statics.findOneAndDelete = function (userName) {
    return this.deleteOne({
        username: userName
    })
}

// 삭제 많이 
userSchema.statics.findManyAndDelete = function (userName, condition) {
    return this.deleteMany({
        username: userName,
        email: condition
    })
}

// 업데이트 값 
userSchema.statics.findOneAndUpdate = function (reqQuery, findvalue, changevalue) {
    // console.log(reqQuery, findvalue,changevalue) 
    // 1. 
    // return this.updateOne({
    //     username: findvalue
    // }, { $set: { username : `${changevalue}` } })

    // 2. 
    // if(reqQuery==="username"){
    //     return this.updateOne({username: findvalue}, { $set: { username : `${changevalue}` } })
    // }else if(reqQuery==="email"){
    //     return this.updateOne({email: findvalue}, { $set: { email : `${changevalue}` } })
    // }
    //this.findOneAndUpdate({reqQuery}, { $set: { username : `${changevalue}` } })

    // 3. reqQuery 에 따라, findValue 로 찾아 chageValue 값 변경 한다. 
    switch (reqQuery) {
        case "username":
            return this.updateOne({
                username: findvalue
            }, {
                $set: {
                    username: `${changevalue}`
                }
            })

        case "email":
            return this.updateOne({
                email: findvalue
            }, {
                $set: {
                    email: `${changevalue}`
                }
            })
    }


}

// 임시 비밀번호 생성
userSchema.methods.tempPasswordGenerate = function (user) {
    const random = randomstring.generate(8);
    user.temp_password = generateBcrpt(random)
    user.temp_password_time = new Date()
    return user.save()
}
// 임시 비밀번호 초기화 및 새로운 비밀번호 업데이트

userSchema.methods.initpasswordFinish = function (user,temp_password,new_password) {
    log("initpasswordFinish")
    log("user")
    log(user)
    log("temp_password")
    log(temp_password)
    //log(user.temp_password)
    log(this.temp_password)
    log("new_password")
    log(new_password)
    const encrypteds = temp_password == this.temp_password
    log(encrypteds)
    if(encrypteds){
        user.password = generateBcrpt(new_password)
        user.temp_password = undefined
        user.temp_password_time = undefined
        return user.save()
    } else {
        return user.save()
    }
    

}




// 비밀번호 암호화 함수
function generateBcrpt(password) {
    // bcryptjs 
    const salt = bcryptjs.genSaltSync(10);
    const hash = bcryptjs.hashSync(password, salt);
    return hash
}
// 비밀번호 확인 함수 
function encrypteBcrpt(password) {
    // bcryptjs 
    const encrypteds = bcryptjs.compareSync(password, this.password)
    return encrypteds
}



module.exports = mongoose.model("User", userSchema); //콜렉션에 모델을 연결한다.