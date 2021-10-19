/* =======================
    LOAD THE CONFIG
==========================*/
const log = (m) => console.log(m);
const clr = () => console.clear();
const config = require(`../../../config`)
const jwt = require('jsonwebtoken')
let User = require('../../../models/user')
const nodemailer = require('nodemailer');


/*
    POST /api/auth/register
    {
        username,
        password
    }
*/
exports.register = (req, res) => {
    //res.send('this router is working')
    console.log("register")
    const {
        username,
        password,
        email
    } = req.body
    let newUser = null

    // create a new user if does not exist
    const create = (user) => {
        if (user) {
            throw new Error('username exists')
        } else {
            return User.create(username, password, email)
        }
    }

    // count the number of the user
    const count = (user) => {
        newUser = user
        return User.count({}).exec()
    }

    // assign admin if count is 1
    const assign = (count) => {
        if (count === 1) {
            return newUser.assignAdmin()
        } else {
            // if not, return a promise that returns false
            return Promise.resolve(false)
        }
    }

    // respond to the client
    const respond = (isAdmin) => {
        console.log("respond")
        res.json({
            message: 'registered successfully',
            admin: isAdmin ? true : false
        })
    }

    // run when there is an error (username exists)
    const onError = (error) => {
        console.log("onError")
        res.status(409).json({
            message: error.message
        })
    }

    // check username duplication
    User.findOneByUsername(username)
        .then(create)
        .then(count)
        .then(assign)
        .then(respond)
        .catch(onError)
}
/*
    POST /api/auth/login
    {
        username,
        password
    }
*/


exports.login = (req, res) => {
    const {
        username,
        password
    } = req.body
    const secret = req.app.get('jwt-secret')

    // check the user info & generate the jwt
    const check = (user) => {
        if (!user) {
            // user does not exist
            throw new Error('login failed : check username')
        } else {
            // user exists, check the password
            if (user.verify(password)) {
                // create a promise that generates jwt asynchronously
                const p = new Promise((resolve, reject) => {
                    // TODO 이곳에서 값 respond 할때, 패스워드 빼고줘야 함. 
                    jwt.sign({
                            _id: user._id,
                            username: user.username,
                            password: user.password,
                            admin: user.admin
                        },
                        secret, {
                            expiresIn: '7d',
                            issuer: 'rain2002kr.gmail.com',
                            subject: 'userInfo'
                        }, (err, token) => {
                            if (err) reject(err)
                            resolve(token)
                        })
                })
                return p
            } else {
                throw new Error('login failed : check password')
            }
        }
    }

    // respond the token 
    const respond = (token) => {
        res.json({
            message: 'logged in successfully',
            token
        })
    }

    // error occured
    const onError = (error) => {
        res.status(403).json({
            message: error.message
        })
    }

    // find the user
    User.findOneByUsername(username)
        .then(check)
        .then(respond)
        .catch(onError)

}

/*
    GET /api/auth/check
*/

exports.check = (req, res) => {
    console.log("api/auth/check")
    res.json({
        success: true,
        info: req.decoded
    })
}

/* 
    GET /api/user/list
*/

exports.list = (req, res) => {
    // refuse if not an admin
    if (!req.decoded.admin) {
        return res.status(403).json({
            message: 'you are not an admin'
        })
    }

    User.find({})
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
    if (!req.decoded.admin) {
        return res.status(403).json({
            message: 'you are not an admin'
        })
    }

    User.findOneByUsername(req.params.username)
        .then(
            user => user.assignAdmin
        ).then(
            res.json({
                success: true
            })
        )
}

/*
    POST /api/auth/reset-password-init
    header {
        none, x-access-tocken
    }
    body {
        email : email address 
    }
*/

exports.resetPasswordInit = (req, res) => {
        //res.send("working resetPasswordInit")
        const userMail = config['send-mail-id']
        const userpass = config['send-mail-pw']
        const {
            username
        } = req.body
        log(username)

        const generateTempPass = (user) => {
            console.log(`generateTempPass : ${new Date()}`)
            if (!user) {
                throw new Error('username is not exists')
            } else {
                return new Promise((resolve, reject) => {
                    user.tempPasswordGenerate(user)
                    if(user.temp_password == null){
                        reject(new Error('temp_password generate failed !'))    
                    }else{
                        resolve(user)
                    }
                })
            }
        }
        const sendEmailTempPass = (user) => {
            console.log(`sendEmailTempPass : ${new Date()}`) 
                // send email 
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    port: 465,
                    secure: true, // true for 465, false for other ports
                    auth: { // 이메일을 보낼 계정 데이터 입력
                        user: `${userMail}`,
                        pass: `${userpass}`,
                    },
                });
                const emailOptions = { // 옵션값 설정
                    from: `${userMail}`,
                    to: `${user.email}`,
                    subject: '비밀번호 초기화 이메일입니다.',
                    html: `<br/> 안녕하세요.  <b>${user.username} 님.</b><br/>` +
                        `<br/>비밀번호 초기화를 위해서, 아래의 임시 비밀번호를 앱에 입력해주세요.` +
                        `<br/>임시 비밀번호 :  <b>${user.temp_password}</b>.` +
                        `<br/>임시 비밀번호는 2분 동안 유효합니다.` +
                        `<br/><br/>감사합니다.` +
                        `<br/>훈스 Hoon co.ltd.`
                };
                return transporter.sendMail(emailOptions);
            }

            // respond to the client
            // info response 
            // {
            //     accepted: [ 'rain2002kr@naver.com' ],
            //     rejected: [],
            //     envelopeTime: 690,
            //     messageTime: 754,
            //     messageSize: 1122,
            //     response: '250 2.0.0 OK  1633941602 n22sm710354pfo.15 - gsmtp',
            //     envelope: { from: 'rain2002kr@gmail.com', to: [ 'rain2002kr@naver.com' ] },
            //     messageId: '<5f2caf60-922d-04c2-1912-6b2ad9a30be5@gmail.com>'
            //   }
            const respond = (info) => {
                log(`respond : ${new Date()}`)
                log('respond mailserver :')
                log(info)
                
                res.json({
                    mailServerMessage : `${info.response}`,
                    message: 'temp password generated and sent email successfully',
                })
            }

            // run when there is an error (username exists)
            const onError = (error) => {
                console.log("onError")
                res.status(409).json({
                    message: error.message
                })
            }


            // check username duplication
            User.findOneByUsername(username)
                .then(generateTempPass)
                .then(sendEmailTempPass)
                .then(respond)
                .catch(onError)

        }
        /*
            POST /api/auth/reset-password-finish
            header {
                none, 
            }
            body {
                email : email address,
                tempPassword : tempPassWord, 
                newPassword : password
            }
        */

        exports.resetPasswordFinish = (req, res) => {
            res.send("working resetPasswordFinish")
            const {
                username,
                temp_password, 
                new_password
            } = req.body
            // log(username)
            // log(temp_password)
            // log(new_password)
            
            // respond to the client
            const initpasswordFinish = (user, temp_password, new_password) => {
                console.log(`initpasswordFinish : ${new Date()}`)
                if (!user) {
                    throw new Error('username is not exists')
                } else {
                    return new Promise((resolve, reject) => {
                        user.initpasswordFinish(user, temp_password, new_password )
                        // if(!user.temp_password == null){
                        //     reject(new Error('temp_password reset failed !'))    
                        // }else{
                        //     resolve(user)
                        // }
                    })
                }
            }

            
            // respond to the client
            const respond = (info) => {
                log(`respond : ${new Date()}`)
                log('respond mailserver :')
                log(info)
                
                res.json({
                    mailServerMessage : `${info.response}`,
                    message: 'temp password generated and sent email successfully',
                })
            }

            // run when there is an error (username exists)
            const onError = (error) => {
                console.log("onError")
                res.status(409).json({
                    message: error.message
                })
            }


            // check username duplication
            User.findOneByUsername(username)
                .then(user => initpasswordFinish(user,temp_password,new_password))
                //.then(userinitpasswordFinish)
                .then(respond)
                .catch(onError)
        }