/* =======================
    LOAD THE DEPENDENCIES
==========================*/
// 익스프레스  
const express = require('express');
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
// 데이터 베이스 
const mongoose = require("mongoose");

/* =======================
    LOAD THE CONFIG
==========================*/
const log = (m) => console.log(m);
const clr = () => console.clear();
const config = require(`./config`)

enviromentSetting("test")

// 환경 설정 세팅 
function enviromentSetting(env) {
    process.env.NODE_ENV = env
    var envs = process.env.NODE_ENV
    dotenv.config({
        path: path.resolve(
            process.cwd(),
            process.env.NODE_ENV == "production" ? "./env_modules/.env" : "./env_modules/.env.dev"
        )
    });
}

//* 포트 세팅 및 시작 */
const port = config['express-port'] //|| process.env.SERVER_PORT


/* =======================
    EXPRESS CONFIGURATION 미들웨어 사용 선언
==========================*/
const app = express();

// parse JSON and url-encoded query
// app.use(bodyParser.urlencoded({extended: false}))
// app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// print the request log on console [dev, combined, tiny, common]
app.use(morgan('combined'))

// set the secret key variable for jwt
app.set('jwt-secret', config.secret)


//public 폴더를 정적폴더로 지정 
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public'));

// app.use(compression());
// app.use(cookieParser());


//미들웨어 만들어 사용하기 
// app.get('*', function (req, res, next) {
//     fs.readdir('./data', function (err, filelist) {
//         req.filelist = filelist;
//         next();
//     });
// });



/* =======================
    EXPRESS API 
==========================*/
// index page, just for testing
app.get('/', (req, res) => {
    res.send('Hello JWT')
})

// configure api router
app.use('/api', require('./routes/index'))

// let User = require('./models/user')
// app.get('/api', (req, res) => {
//     const json = req.body
//     log(`json: ${json.username}`)
//     const gson = JSON.stringify(json)
//     log(`gson: ${gson}`)
    // User.findOneByUsername(json.username)
    //     .then(user => 
    //         console.log(user))
    //         .then(res.json({"good":"good"}))
    // User.findOneAndUpdate(json.username, json.changename)
    // .then(user => 
    //     console.log(user))
    //     .then(res.json({"good":"good"}))



    // User.findOneAndUpdate(json.reqQuery, json.findvalue, json.changevalue)
    //     .then(user => console.log(user))
    //     .then(res.json({
    //         "good": "good"
    //     }))

    // User.findOneAndDelete(json.findvalue)
    //     .then(user => console.log(user))
    //     .then(res.json({
    //         "good": "good"
    //     }))
    // User.findManyAndDelete(json.findvalue, json.changevalue)
    //     .then(user => console.log(user))
    //     .then(res.json({
    //         "good": "good"
    //     }))


//})

// open the server
app.listen(port, () => {
    log(`Express is running on port ${port}`)
})


//ERROR Handlers default
app.use(function (req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

//SERVER ERROR(서보 오류발생)
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})



/* =======================
    CONNECT TO MONGODB SERVER
==========================*/
mongoose.connect(config.mongodbUri)
const db = mongoose.connection
db.on('error', console.error)
db.once('open', ()=>{
    log(`connected to mongodb server : ${config.mongodbUri}`)
})


module.exports = app;

