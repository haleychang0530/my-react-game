const Fastify = require('fastify');
const fastify = Fastify();  //處理絕對路徑之HTTP請求
const cors = require('@fastify/cors');  //fastfiy之跨域
const { Client } = require('pg'); 
const port = process.env.PORT || 3000;
const path = require('path');
console.log('API base URL:', process.env.API_URL);

// 連接到 PostgreSQL 資料庫
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log('PostgreSQL Connected'))
  .catch(err => console.log(err));

// 允許來自前端之跨域請求
fastify.register(cors, {
  origin: 'https://my-react-game-front-uoqw.onrender.com',
  credentials: true, 
  methods: ['GET', 'POST']
});

// 建立用戶資料表（如果資料表不存在）
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,-- id
    username VARCHAR(250) UNIQUE NOT NULL,-- 用戶名
    password VARCHAR(250) NOT NULL,-- 密碼
    petname VARCHAR(250) UNIQUE NOT NULL, --寵物名
    hp INT DEFAULT 100, -- 寵物HP 100
    score INT DEFAULT 0 -- 用戶分數 0
);
`;

client.query(createTableQuery)
  .then(() => console.log('Players table created or already exists'))
  .catch(err => console.log(err));

// 唤醒接口，防止伺服器休眠
fastify.post('/wakeup', async (request, reply) => {
    reply.send('"ok!"');
});

// 創建新帳號
fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body;
    try {
        const result = await client.query(
            'INSERT INTO players (username, password, petname, hp, score) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [username, password, 'Cutie', 100, 3500]
        );
        reply.code(201).send(result.rows[0]);
    } catch (err) {
        console.log(err);
       if (err.code === '23505') {  //NOT UNIQUE error
            reply.code(400).send({ message: 'Username already exists' });
        }
        else reply.code(500).send({ error: 'Error creating account' });
    }
});

// 獲取玩家分數
fastify.get('/getScore', async (request, reply) => {
    const { username } = request.query;
    try {
        const result = await client.query(
            'SELECT score FROM players WHERE username = $1',
            [username]
        );
        if (result.rows.length > 0) {
            return reply.send({ score: result.rows[0].score });
        }
        reply.code(404).send({ error: 'Player not found' });
    } catch (err) {
        console.log(err);
        reply.code(500).send({ error: 'Internal server error' });
    }
});

// 更新玩家分數
fastify.post('/updateScore', async (request, reply) => {
    const { username, petname, score } = request.body;
    try {
        const result = await client.query(
            'UPDATE players SET score = score + $1 WHERE username = $2 AND petname = $3 RETURNING *',
            [score, username, petname]
        );
        if (result.rows.length > 0) {
            return reply.send(result.rows[0]);
        }
        reply.code(404).send({ error: 'Player not found' });
    } catch (err) {
        console.log(err);
        reply.code(500).send({ error: 'Internal server error' });
    }
});

// 獲取排行榜
fastify.get('/leaderboard', async (request, reply) => {
    try {
        const result = await client.query('SELECT * FROM players ORDER BY score DESC');
        reply.send(result.rows);
    } catch (err) {
        console.log(err);
        reply.code(500).send({ error: 'Internal server error' });
    }
});

// 啟動伺服器
fastify.listen(port, () => {
    console.log(`Server is running at PORT:${port}`);
});
