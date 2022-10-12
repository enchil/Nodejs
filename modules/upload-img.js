const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const extMap = {
    'image/jpeg': '.jpg',
    'image/jpeg': '.png',
    'image/jpeg': '.gif',
};

const fileFilter = (req, file, callback) => {
    callback(null, !!extMap[file.mimetype])
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, __dirname + '/../public/uploads')
    },
    filename: (req, file, callback) => {
        const ext = extMap[file.mimetype]; //副檔名
        callback(null, uuidv4() + ext);
    }
});

const upload = multer({ storage, fileFilter });
module.exports = upload;