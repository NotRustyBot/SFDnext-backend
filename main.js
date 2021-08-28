const http = require('http');
const fs = require('fs');

http.createServer(function (request, response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.writeHead(200);
    let questlets = request.url.split('/');
    questlets.shift();
    if (questlets.length > 0) {
        if (questlets[0] == "leaderboard") {
            response.write(JSON.stringify(prepareData()));
        }
    }

    response.end();
}).listen(5000);

const dataFile = './sfdn.txt';

let fsWait = false;
fs.watch(dataFile, (event, filename) => {
    if (filename) {
        if (fsWait) return;
        fsWait = setTimeout(() => {
            fsWait = false;
        }, 100);
        console.log(`${filename} file Changed`);
        loadData(fs.readFileSync(dataFile, 'utf8'));
    }
});

let users = [];
let score = [];
let names = [];

/**
 * @param string {string} 
 */
function loadData(string) {
    let data = string.split('\n');
    for (let i = 1; i < data.length; i++) {
        const line = data[i].split('|');
        let name = line[1];
        if (name == "users") {
            line.shift();
            line.shift();
            users = line;
        }
        if (name == "score") {
            line.shift();
            line.shift();
            score = line;
        }
        if (name == "names") {
            line.shift();
            line.shift();
            names = line;
        }
    }
}

function prepareData() {
    let output = [];
    let ranks = score.slice();
    ranks.sort((a, b) => b - a);
    for (let i = 0; i < users.length; i++) {
        let obj = {};
        obj.user = users[i];
        obj.score = score[i];
        obj.name = names[i];
        obj.rank = ranks.indexOf(obj.score) + 1;
        if (obj.rank == 0) {
            continue
        }
        obj.badge = getBadge(obj.rank, ranks.length);
        output.push(obj);
    }
    return output;
}

const Badge = {
    Top1: 1,
    Top2: 2,
    Top3: 3,
    Elite: 4,
    Superfighter: 5,
    Fighter: 6,
    Punk: 7,
    Meatbag: 8
}

/**
 * @param rank {number}
 * @param maxRank {number}
 */
function getBadge(rank, maxRank) {
    if (rank == 1) return Badge.Top1;
    if (rank == 2) return Badge.Top2;
    if (rank == 3) return Badge.Top3;
    if (rank < 10) return Badge.Elite;
    if (rank < maxRank * 0.25) return Badge.Superfighter;
    if (rank < maxRank * 0.5) return Badge.Fighter;
    if (rank < maxRank * 0.75) return Badge.Punk;
    return Badge.Meatbag;
}

loadData(fs.readFileSync(dataFile, 'utf8'));