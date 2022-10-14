require('dotenv').config(); //自動去讀.env
const express = require('express');
const session = require('express-session');
const moment = require('moment-timezone');
const db = require(__dirname + '/modules/db_connect2');


const multer = require('multer');
const { format } = require('path');
const { runInNewContext } = require('vm');

//const upload = multer({ dest: 'tmp_uploads/' });//設定上傳的地方
const upload = require(__dirname + '/modules/upload-img');


const fs = require('fs').promises;

const app = express();

app.set('view engine', 'ejs')//註冊樣版引擎


//top level middleware
app.use(session({
    saveUninitialized: false, //一開始是否要回存
    resave: false, //是否要強制回存
    secret: 'Apple',//加密的字串
    cookie: {
        maxAge: 100_000,//存活時間(重刷網頁一次會從新計算)

    }//設定cookie存活時間
}))

app.use(express.urlencoded({ extended: false }));// 
app.use(express.json());

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