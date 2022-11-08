const jwt = require('jsonwebtoken');

const str = jwt.sign({
    sid:10,
    account: 'enchi'
}, 'enchienchienchi')

console.log(str);