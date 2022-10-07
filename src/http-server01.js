const http = require('http');

const server = http.createServer((request, response) => {
    response.writeHead(200, {
        'Content-Type': 'test/plain'
    })
    response.end('<h2>ABC</h2>');
});

server.listen(3000);