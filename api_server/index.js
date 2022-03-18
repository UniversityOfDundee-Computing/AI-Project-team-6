const http = require("http");
const url = require("url");
const fs = require('fs');
const path = require('path');
const mime = require('mime-types')


const HTTP_HOST = '0.0.0.0';
const SERVER_PORT = 8000;


const requestHandler = function (req, res) {
    // Convert the url into a usable path
    let route = url.parse(req.url).pathname.toLowerCase();

    // forward the api requests to the api method or error if the http method is not post
    if (route.startsWith("/api/")) {
        res.setHeader("Content-Type", "application/json");
        if (req.method !== "POST") {
            res.writeHead(405);
            res.end(JSON.stringify({error: "METHOD NOT ALLOWED", code: 405, method: req.method}));
            return;
        }
        handleAPI(req, res);

    } else if (!route.startsWith("/api_server/")) { // Check we are not trying to list the server directory
        if (route.endsWith("/")) // Conventional forward of index page
            route += "index.html";

        // Attempt to get the right file and return it, otherwise 404
        fs.readFile(path.join("..", route), function (error, fileContent) {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end("NOT FOUND");
                }
            } else {
                res.writeHead(200, {'Content-Type': mime.lookup(route)});
                res.end(fileContent, 'utf-8');
            }
        });

    } else { // Server directory is not authorised
        res.writeHead(401);
        res.end("UNAUTHORISED");
    }
};

// Spin up simple http server
const server = http.createServer(requestHandler);
server.listen(SERVER_PORT, HTTP_HOST, () => {
    console.log(`API Server on port ${SERVER_PORT}`);
});

function handleAPI(req, res) {
    /*require("../script/algorithms/approach1");
    require("../script/algorithms/approach3");
    require("../script/process");*/

    let chunks = '';
    req.on('data', chunk => {
        chunks += chunk;
    })
    req.on('end', () => {
        try {
            const data = JSON.parse(chunks);
            const targets = [];

            if ((data.targets === undefined) || (data.start === undefined) ||
                (data.start.x === undefined) || (data.start.y === undefined) ||
                (data.map === undefined) || (data.approach === undefined)) {
                res.writeHead(500);
                res.end(JSON.stringify({error: "MALFORMED JSON", code: 500}));
                return;
            }


            data.targets.forEach((target) => {
                if (res.head === 500)
                    return;

                if (target.x !== undefined && target.y !== undefined)
                    targets.push(new Location(target.x, target.y));
                else {
                    res.writeHead(500);
                    res.end(JSON.stringify({error: "MALFORMED JSON", code: 500}));
                }
            });

            if (res.head === 500)
                return;

            let apiResponse = {};
            apiResponse = findPath(data.map, new Location(data.start.x, data.start.y), targets, data.approach);
            res.end(JSON.stringify(apiResponse));
        } catch (e) {
            res.writeHead(500);
            res.end(JSON.stringify(e));
        }
    })

}
