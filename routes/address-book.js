const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../modules/db_connect2');
const upload = require(__dirname + '/../modules/upload-img');

router.use((req, res, next) => {
    next();
});


//router.get(['/', '/list'], async (req, res) 原本的
async function getListData(req, res){
    const perPage = 20;
    let page = +req.query.page || 1;
    if (page < 1) {
        return res.redirect(req.baseUrl);//轉向 api時不應該轉向

    };

    let search = req.query.search ? req.query.search.trim() : '';
    let where = `WHERE 1 `;//ture 全選
    if (search) {
        where += ` AND 
        (
            \`name\` LIKE ${db.escape('%' + search + '%')}
            OR
            \`address\` LIKE ${db.escape('%' + search + '%')}
            ) `//AND前面有空白
        // res.type('text/plain; charset=utf-8')
        // return res.end(where);
    };

    const t_sql = `SELECT COUNT(1) totalRows FROM address_book ${where}`;
    const [[{ totalRows }]] = await db.query(t_sql);
    let totalPages = 0;
    let rows = [];
    if (totalRows > 0) {
        totalPages = Math.ceil(totalRows / perPage);
        if (page > totalPages) {
            return res.redirect(`?page=${totalPages}`);
        }
        const sql = `SELECT * FROM address_book ${where} ORDER BY sid DESC LIMIT ${(page - 1) * perPage}, ${perPage}`;
        [rows] = await db.query(sql);
    }

    //res.render('address-book/list', 
    return { totalRows, totalPages, perPage, page, rows, search, query: req.query };
}
    //CRUD


    //新增資料
    router.get('/add', async (req,res)=>{
        res.render('address-book/add')
    });
    router.post('/add', upload.none(), async (req,res)=>{
        res.json(req.body)
    });


    router.get(['/', '/list'], async (req,res)=>{
        const data = await getListData(req,res);
        res.render('address-book/list', data);
    });

    router.get(['/api', '/api/list'],async (req,res)=>{
        res.json(await getListData(req,res));
    });


module.exports = router;