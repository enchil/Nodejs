require('dotenv').config(); //自動去讀.env
const express = require('express');

const app = express();

app.set('view engine', 'ejs')//註冊樣版引擎

app.use(express.static('public'));//從根目錄找public把整包引進來


//設定路由 routes: locolhost:3001
app.get('/', (req, res) => {
    // res.send(`<h2>hello index</h2>`);
    res.render('main', { name: 'ENCHI' })// 去main.ejs找template
});

//設定路由 routes: locolhost:3001/abc
app.get('/abc', (req, res) => {
    res.send(`<h2>hello index</h2>`);
});

app.get('/json-test', (req, res) => {
    res.json({ name: 'chichi', age: '18' });
});

app.use(express.static('node_modules/bootstrap/dist'));//從根目錄找node_modules/bootstrap/dist引進來


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