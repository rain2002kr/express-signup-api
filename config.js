// # 서버 IP 입력시, 127.0.0.1 ~ 127.999.999.999 세팅 가능.
// SERVER_URL = 127.0.0.2 
// SERVER_PORT = 5000

// # 몽고 DB 설치 되어있는 세팅은 127.0.0.1 이다. 
// DB_URL = mongodb://127.0.0.1:27017
// DB_NAME =/test
// DB_ONLINE_URL = mongodb+srv://rain2002kr:password@hoonscluster.8xc1u.gcp.mongodb.net/SMART_STORE_SYSTEM?retryWrites=true&w=majority

module.exports = {
    'secret': 'SeCrEtKeYfOrHaShInG',
    'mongodbUri': 'mongodb://127.0.0.1:27017/userdb',
    'express-port':'3000',
    'send-mail-id': 'rain2002kr@gmail.com',
    'send-mail-pw': 'epsapmnqecwrqaxw',
    'toMail': '',

}




