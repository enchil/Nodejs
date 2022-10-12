require('dotenv').config(); //自動去讀.env
const express = require('express');

const multer = require('multer');

//const upload = multer({ dest: 'tmp_uploads/' });//設定上傳的地方
const upload = require(__dirname + '/modules/upload-img');


const fs = require('fs').promises;

const app = express();

app.set('view engine', 'ejs')//註冊樣版引擎

app.use(express.static('public'));//從根目錄找public把整包引進來

app.use(express.urlencoded({ extended: false }));// top-level middleware
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


app.post('/try-upload', upload.single('avatar'), async (req, res) => { res.json(req.file);
    /*if(req.file && req.file.originalname){//判斷有沒有檔名
    await fs.rename(req.file.path, `public/imgs/${req.file.originalname}`);
    //搬動路徑
    res.json(req.file);
}else{
    res.json({msg:'沒有上傳檔案'});
}*/
});  //只能上傳單一個檔案，檔案欄位是avatar

app.use(express.static('node_modules/bootstrap/dist'));//從根目錄找node_modules/bootstrap/dist引進來當根目錄


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