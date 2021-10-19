# 타이틀 
### Express api 회원가입 서버 with mongoDB

1. 의존 모듈 설치 
 - package.json 참조 
 - jsonwebtoken: 핵심 모듈, JSON Web Token 생성 검증 -jwt-secret
 - morgan : This module is used to print logs in terminal for each http request.

2. 안드로이드 테스트 완료 버젼 21.10.09 
  - todo POST /api/auth/register
  - todo POST /api/auth/login  
  - todo GET /api/auth/check
  - todo GET /api/user/list

3. 전체 업데이트 내용 
  - crpto -> Bcrypt  적용 
  - 다음 모델 적용 
    "basic-auth",
    "bcryptjs": ,
    "nodemailer",
    "randomstring"

      basic-auth : This is used for login authentication. The email and password is sent by client as a Base64 encoded string in header which is decoded by this module.
      bcyptjs : Use to create and verify password hash using bcrpyt hasing algorithm.
      nodemailer : This module is used to sent mail using SMTP for forgot password process.
      randomstring : This module is used to generate random string which we use as a token for reset password.

userSchema
  name 			: String,
	email			: String, 
	hashed_password	: String,
	created_at		: String,
	temp_password	: String,
	temp_password_time: String 

4. bcryptjs 
  // bcryptjs 패스워드 생성 
    const salt = bcryptjs.genSaltSync(10);
    const hash = bcryptjs.hashSync(password, salt);
  // 패스워드 분석 , 맞으면 true 나옴 
  const encrypted = bcryptjs.compareSync(password, this.password)

5. 패스워드 변경, 미들웨어(모간 : 기능5가지 [combined, tiny, dev, common])
  프로미스 학습 완료
  프로미스 체이닝 학습 완료 : return new Promise((resolve,reject) => {})
  체인지 패스워드 작업 완료

6. 패스워드 리셋, 분실 프로세스 추가 
 임시 패스워드 생성후, 이메일 전송 
 임시 패스워드 가지고 리셋후 새로운 비밀번호 저장, 
 추가 정리 필요...

