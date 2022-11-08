require('dotenv').config(); //自動去讀.env
const express = require('express');
const session = require('express-session');
const moment = require('moment-timezone');
const MysqlStore = require('express-mysql-session')(session);
const db = require(__dirname + '/modules/db_connect2');
const sessionStore = new MysqlStore({}, db);
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const multer = require('multer');


//const upload = multer({ dest: 'tmp_uploads/' });//設定上傳的地方
const upload = require(__dirname + '/modules/upload-img');
const fs = require('fs').promises;

const app = express();

app.set('view engine', 'ejs')//註冊樣版引擎


//top level middleware
const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        console.log({ origin });
        callback(null, true)
    }
};
app.use(cors(corsOptions));
app.use(session({
    saveUninitialized: false, //一開始是否要回存
    resave: false, //是否要強制回存
    secret: 'Apple',//加密的字串
    store: sessionStore,
    cookie: {
        maxAge: 100_000,//存活時間(重刷網頁一次會從新計算)
    }//設定cookie存活時間
}))

app.use(express.urlencoded({ extended: false }));// 
app.use(express.json());

// 自己定義的 template helper functions
app.use((req, res, next) => {
    res.locals.toDateString = (d) => {
        return moment(d).format('YYYY-MM-DD');
    }
    res.locals.toDatetimeString = (d) => moment(d).format('YYYY-MM-DD HH:mm:ss');
    res.locals.title = 'En的list網站';
    res.locals.session = req.session;

    next();
});

//設定路由 routes: locolhost:3001
app.get('/', (req, res) => {
    // res.send(`<h2>hello index</h2>`);
    res.render('main', { name: 'ENCHI' })// 去main.ejs找template
});

//設定路由 routes: locolhost:3001/abc
app.get('/abc', (req, res) => {
    res.send(`<h2>hello index</h2>`);
});

app.get('/sales-json', (req, res) => {
    const sales = require(__dirname + '/data/sales');
    console.log(sales);
    res.render(`sales-json`, { sales });
});

app.get('/json-test', (req, res) => {
    res.json({ name: 'chichi', age: '18' });
});

app.get('/try-qs', (req, res) => {
    res.json(req.query);
});

app.post('/try-post', (req, res) => {
    res.json(req.body);
});

app.get('/try-post-form', (req, res) => {
    res.render('try-post-form');
});//render到表單
app.post('/try-post-form', (req, res) => {
    res.render('try-post-form', req.body);
});//拿到資料


app.post('/try-upload', upload.single('avatar'), async (req, res) => {
    res.json(req.file);
    /*if(req.file && req.file.originalname){//判斷有沒有檔名
    await fs.rename(req.file.path, `public/imgs/${req.file.originalname}`);
    //搬動路徑
    res.json(req.file);
}else{
    res.json({msg:'沒有上傳檔案'});
}*/
});  //只能上傳單一個檔案，檔案欄位是avatar

app.post('/try-upload2', upload.array('photos'), async (req, res) => { res.json(req.files) });

app.get('/my-params1/:action?/:id?', async (req, res) => {
    res.json(req.params);
});

app.get(/^\/m\/09\d{2}-?\d{3}-?\d{3}$/i, (req, res) => {
    let u = req.url.slice(3);
    u = u.split('?')[0];
    u = u.split('-').join('');
    res.json({ mobile: u });
});

app.use('/admin2', require(__dirname + '/routes/admin2'));

const myMiddle = (req, res, next) => {
    res.locals = { ...res.locals, enchi: '哈哈哈' }
    res.locals.derrr = '哈哈哈derrr';
    // res.myPersonal = {...res.locals, enchi:'哈哈哈'}//掛在locals比較好
    next();
}
app.get('/try-middle', [myMiddle], (req, res) => {
    res.json(res.locals);
})

app.get('/try-session', (req, res) => {
    req.session.aaa ||= 0,//全域預設值 一進來判斷是否拜訪過
        req.session.aaa++;  //刷新頁面＋1
    res.json(req.session);
})


app.get('/try-date', (req, res) => {
    const now = new Date;
    const fm = 'YYYY-MM-DD HH:mm:ss'
    const m = moment('10/07/22', 'DD/MM/YY');//可以給format

    res.json({
        t1: now,
        t2: now.toString(),
        t3: now.toDateString(),
        t4: now.toLocaleDateString(),
        m,
        m1: m.format(fm),
        m2: m.tz('Europe/London').format(fm),
        t: m.tz('Europe/London').format(fm) - m.format(fm)
    })
})


app.get('/try-db', async (req, res) => {
    const [rows] = await db.query("SELECT * FROM address_book LIMIT 5")
    res.json(rows);
});

app.get('/try-db-add', async (req, res) => {
    const name = '小胖';
    const email = 'kink@gmail.com';
    const mobile = '0923434343';
    const birthday = '1999-10-11';
    const address = 'Taipei';
    const sql = "INSERT INTO `address_book`(`name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES (?,?,?,?,?,NOW())";
    const [result] = await db.query(sql, [name, email, mobile, birthday, address])
    res.json(result);
});

app.get('/try-db-add2', async (req, res) => {
    const name = '小胖2';
    const email = 'kink@gmail.com';
    const mobile = '0923434343';
    const birthday = '1999-10-11';
    const address = 'Taipei';
    const sql = "INSERT INTO `address_book` SET? ";
    const [result] = await db.query(sql, [{ name, email, mobile, birthday, address, created_at: new Date() }])
    res.json(result);
});

app.use('/ab', require(__dirname + '/routes/address-book'));

app.get('/fake-login',(req,res)=>{
    req.session.admin = {
        id:12,
        account: 'enchi',
        nickname: 'enen'
    };
    res.redirect('/');
});

app.get('/logout',(req,res)=>{
    delete req.session.admin;
    res.redirect('/');
});

app.get('/yahoo',async (req,res)=>{
   const response = await axios.get('https://tw.yahoo.com/');
   res.send(response.data);
});

app.get('/cate',async (req,res)=>{
    const [rows] = await db.query("SELECT * FROM categories ORDER BY `parent_sid`");

    const firsts = [];
    for(let i of rows){
        if(i.parent_sid===0){
            firsts.push(i)
        }
    };

    for(let f of firsts){
        for(let i of rows){
            if(f.sid===i.parent_sid){
                f.children ||= [];
                f.children.push(i)
            }
        }
    }
    
    res.json(firsts);
 });

app.get('/cate2',async (req,res)=>{
    const [rows] = await db.query("SELECT * FROM categories ORDER BY `parent_sid`");

    // 編輯字典
    const dict = {};
    for(let i of rows){
        dict[i.sid]=i;
    };

    for(let i of rows){
        if(i.parent_sid!=0){
            const p = dict[i.parent_sid];
            p.children ||=[];
            p.children.push(i);
        }
        
    }

    // 把第一層拿出來
    const firsts = [];
    for(let i of rows){
        if(i.parent_sid===0){
            firsts.push(i)
        }
    };
    
    
    res.json(firsts);
});

app.post('/login-api', async (req,res)=>{
    const output={
        success:false,
        error:'帳密錯誤',
        postData: req.body,//除錯用
        auth:{}
    };
    //req.body
    const sql = "SELECT * FROM admins WHERE account=?";
    const [rows] = await db.query(sql, [req.body.account]);

    if(! rows.length){
        return res.json(output);
    }

    const row =rows[0];

    output.success = await bcrypt.compare(req.body.password, row['password_hash']);

    if (output.success) {
        output.error='';
        const {sid, account, admin_group} = row;
        const token = jwt.sign(
            {sid, account, admin_group}
        , process.env.JWT_SECRET);
        
        output.auth = {
            sid,
            account,
            token,
        }
    }

    res.json(output)
})

// ------------------------------------------------

//----------------------------------------------------------
app.use(express.static('public'));//從根目錄找public把整包引進來
app.use(express.static('node_modules/bootstrap/dist'));//從根目錄找node_modules/bootstrap/dist引進來當根目錄
//----------------------------------------------------------


app.use((req, res) => { //沒有路徑(錯誤路徑)
    res.type('text/html');//設定要plain還是html
    res.status(404).render('404');
    // res.send(`<h2> 404找不到網頁</h2>`);
});

//監聽
// app.listen(3000, () => {
//     console.log('server started');
// })

//沒有設定SERVER_PORT=3001 就去3002
const port = process.env.SERVER_PORT || 3002;
app.listen(port, () => {
    console.log(`server started, port: ${port}`);
});