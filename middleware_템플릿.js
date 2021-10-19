// 익스프레스  
const createError = require("http-errors");
const express = require('express');
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// 미들웨어 
const helmet = require('helmet')
const compression = require('compression');
const session = require('express-session')
const FileStore = require('session-file-store')(session);
// 플래시 메시지
const flash = require('connect-flash');
// 파일 시스템 (디렉토리 읽기)
const fs = require('fs');

//소켓 io
const socketIO = require("socket.io");

// 데이터 베이스 
const mongoose = require("mongoose");



//* 포트 세팅 및 시작 */
const port = 3000
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(compression()); //압축을 위한 솔루션
app.use(helmet()); //보안을 위한 솔루션 

//fileStore 에 session 저장
var fileStoreOptions = {};

app.use(session({
    secret: 'keyboard cat',
    resave: false, //기본값으로 세팅 ,추후 필요하면 변경 
    saveUninitialized: true, //기본값으로 세팅 ,추후 필요하면 변경 
    store: new FileStore(fileStoreOptions)
}));

//flash message 사용 
app.use(flash());
var passport = require('./lib/passport')(app);

//프로미스 중첩에 빠지지 않도록 도와줌
mongoose.Promise = global.Promise;


// 프로젝트 라우터 사용 예제
var topicRouter = require('./routes/router')
var authRouter = require('./routes/auth')(passport)
var indexRouter = require('./routes/index')


//미들웨어 만들어 사용하기 
app.get('*', function (req, res, next) {
    fs.readdir('./data', function (err, filelist) {
        req.filelist = filelist;
        next();
    });
});

//app 세팅, 즉 사용 원하는 미들웨어에 대해 사용한다고 선언 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//public 폴더를 정적폴더로 지정 
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public'));

app.use(compression());
app.use(logger("dev"));

app.use(cookieParser());


// 라우터 장착 지정 
app.use('/topic', topicRouter);
app.use('/auth', authRouter);
app.use('/', indexRouter);


//ERROR Handlers default
app.use(function (req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

//SERVER ERROR(서보 오류발생)
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})


module.exports = app;

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))