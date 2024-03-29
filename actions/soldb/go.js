const fs = require('fs');
const mysql = require('mysql2/promise');
const { Octokit } = require("@octokit/core");
require('dotenv/config');

main();
async function main() {
    console.log('howdy from nodejs land');
    const eventData = await readFile(process.env.GITHUB_EVENT_PATH);
    const octokit = new Octokit({ auth: process.env.GH_PERSONAL_ACCESS_TOKEN });
    const { head_commit } = eventData;
    
    const response = await octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', {
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        ref: head_commit.id
    });

    const { data } = response;
    const { files } = data;
    files.forEach(console.log);

    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    // query database
    const [rows, fields] = await connection.execute('SELECT * FROM `collections`');
    await connection.close();
}

function readFile(path) {
    return new Promise((resolve) => {
        try {
            fs.readFile(path, {}, (err, data) => {
                if (err) {
                    console.log(err);
                    resolve([]);
                    return;
                }
                const json = JSON.parse(data.toString());
                resolve(json);
            });
        } catch (error) {
            console.log(error);
            resolve([]);
        }
    });
}
