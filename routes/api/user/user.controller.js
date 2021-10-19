/* =======================
    LOAD THE CONFIG
==========================*/
const log = (m) => console.log(m);
const clr = () => console.clear();
const User = require('../../../models/user')


/* 
    GET /api/user/list
*/

exports.list = (req, res) => {
    // refuse if not an admin
    console.log("api/auth/check")
    if (!req.decoded.admin) {
        return res.status(403).json({
            message: 'you are not an admin'
        })
    }

    User.find({}, '-password').exec()
        .then(
            users => {

                res.json({
                    users
                })
            }
        )


}


/*
    POST /api/user/assign-admin/:username
*/
exports.assignAdmin = (req, res) => {
    // refuse if not an admin
    console.log("assignAdmin")
    if (!req.decoded.admin) {
        return res.status(403).json({
            message: 'you are not an admin'
        })
    }

    User.findOneByUsername(req.params.username)
        .then(
            user => {
                if (!user) throw new Error('user not found')

                user.assignAdmin()
            }
        ).then(
            res.json({
                success: true
            })
        ).catch(
            (err) => {
                res.status(404).json({
                    message: err.message
                })
            }
        )
}

/*
    POST /api/user/change-password
    {
        password,
        newPassword
    }
*/


exports.changePassword = (req, res) => {
    const {
        username,
        password
    } = req.decoded
    const {
        oldpassword,
        newPassword
    } = req.body

    const checkPassword = (user, oldpassword) => {
        //log('Promise Start function')
        return new Promise((resolve, reject) => {

            setTimeout(() => {
                if (user.checkPassword(oldpassword)) {
                    const tokens = " 비밀번호 일치"
                    //log(tokens)
                    //user.changePassword(user, newPassword)
                    resolve(user)
                } else {
                    reject(new Error("not found user"))
                }
            }, 0);
        })
    }

    const changePassword =(user) =>{
        //log('Promise change password function')
        return new Promise((resolve, reject) => {
            user.changePassword(user, newPassword)
            resolve("변경완료")
        })
    }

    // respond the token 
    const respond = (tokens) => {
        res.json({
            message: `password is changed successfully${tokens}`
        })
    }

    // error occured
    const onError = (error) => {
        res.status(403).json({
            message: error.message
        })
    }
    User.findOneByUsername(username)
        .then((user) => {
            return checkPassword(user, oldpassword)
        })
        .then((user) => {
            return changePassword(user)
        })
        .then((mess)=>respond(mess))
        .catch(onError)





}

