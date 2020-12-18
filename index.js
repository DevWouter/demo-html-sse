var http = require('http');
var fs = require('fs');

var sseHandlers = [];

var server = http.createServer(function (req, res) {
    console.log(`${req.method} ${req.url}`);
    switch (req.method) {
        case "GET": return handleGet(req, res);
        case "POST": return handlePost(req, res);
    }
});

console.log("listening on port 5050")
server.listen(5050);

/**
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
function handlePost(req, res) {
    if (req.url == "/events") {
        var body = '';
        req.on("data", (data) => { body += data; });

        req.on("end", () => {
            sseHandlers.forEach(cb => {
                cb(body);
            });

            res.statusCode = 201;
            res.end();
        });
    }
}

/**
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
function handleGet(req, res) {
    if (req.url == "/events") {
        completeUsingServerSentEvents(req, res);
    } else {
        completeUsingFileSystem(req, res);
    }
}

/**
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
function completeUsingServerSentEvents(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    var cb = (data) => {
        res.write(`data: ${data}\n\n`);
    };

    sseHandlers.push(cb);

    req.on("close", () => {
        var i = sseHandlers.findIndex(cb);
        if (i !== -1) sseHandlers.splice(i, 1);
    });

    req.on("error", () => {
        var i = sseHandlers.findIndex(cb);
        if (i !== -1) sseHandlers.splice(i, 1);
    });
}

/**
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
function completeUsingFileSystem(req, res) {
    if (req.url == "/") {
        req.url = "/index.html";
    }

    fs.readFile("public" + req.url, (ex, buffer) => {
        if (ex) {
            // An error occured (file not found or illegal path)
            res.statusCode = 404;
            res.end(JSON.stringify(ex));
        } else {
            // Send the data in the response.
            if (req.url.endsWith(".js")) {
                res.setHeader("content-type", "text/javascript; charset=UTF-8");
            }
            res.end(buffer);
        }
    });
}

