const jwt = require('jsonwebtoken');

const myToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWQiOjEwLCJhY2NvdW50IjoiZW5jaGkiLCJpYXQiOjE2Njc4MDg5NTl9.mnGVxZGP1QyxQ686IEyuqxWV9IczvgzsG8PJ9a7cjcA'

const payload = jwt.verify(myToken, 'enchienchienchi')

console.log(payload);