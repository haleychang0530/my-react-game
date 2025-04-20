const express = require('express'); //HTTP請求
const cors = require('cors'); //跨域
const { Client } = require('pg'); 
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

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

// 允許來自前端網站的請求
app.use(cors({
  origin: 'https://my-react-game-front-uoqw.onrender.com',
  methods: ['GET', 'POST'], 
  credentials: true         
}));
// 解析 JSON 請求
app.use(express.json());

// 建立用戶資料表（如果資料表不存在）
const createTableQuery = `
  DROP TABLE IF EXISTS players;

  CREATE TABLE players (
    username TEXT PRIMARY KEY UNIQUE,
    password TEXT NOT NULL,
    petname TEXT DEFAULT 'Cutie',
    hp INTEGER DEFAULT 100,
    score INTEGER DEFAULT 0
  );
`;

client.query(createTableQuery)
  .then(() => console.log('Players table created or already exists'))
  .catch(err => console.log(err));


// 唤醒接口，防止伺服器休眠
app.post('/wakeup', (req, res) => {
    res.send('"ok!"');
});

// 登入與創建新帳號
app.post('/createAccount', async (req, res) => {
    const { username, password} = req.body;
    try {
        const result = await client.query(
            'INSERT INTO players (username, password, petname, hp, score) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [username, password, 'Cutie', 100, 1000]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log(err);
       if (err.code === '23505') {  //NOT UNIQUE error
            res.status(409).json({ message: 'Login Successfully!' });
        }
        else res.status(500).json({ error: 'Error creating account' });
    }
});

// 用戶登入
app.get('/checkUnique', async (req, res) => {
    const { username } = req.query; 
    try {
        const result = await client.query(
            'SELECT * FROM players WHERE username = $1', 
            [username]
        );
        if (result.rows.length > 0) {
            return res.json({ exists: true }); 
        }
        res.json({ exists: false }); 
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// get all status
app.get('/pet-status', async (req, res) => {
    const { username } = req.query;
    try {
        const result = await client.query(
            'SELECT hp, score FROM players WHERE username = $1',
            [username]
        );
        if (result.rows.length > 0) {
            return res.json({ 
                hp: result.rows[0].hp, 
                score: result.rows[0].score 
            });
        }
        res.status(404).json({ error: 'Player not found' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 獲取玩家分數
app.get('/getScore', async (req, res) => {
    const { username } = req.query;
    try {
        const result = await client.query(
            'SELECT score FROM players WHERE username = $1',
            [username]
        );
        if (result.rows.length > 0) {
            return res.json({ score: result.rows[0].score });
        }
        res.status(404).json({ error: 'Player not found' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 更新玩家分數
app.post('/updateScore', async (req, res) => {
    const { username, hp, score } = req.body;
    try {
        const result = await client.query(
            'UPDATE players SET score = score + $1 WHERE username = $2 AND hp = $3 RETURNING *',
            [score, username, hp]
        );
        if (result.rows.length > 0) {
            return res.json(result.rows[0]);
        }
        res.status(404).json({ error: 'Player not found' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 獲取排行榜
app.get('/leaderboard', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM players ORDER BY score DESC');
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`Server is running at PORT:${port}`);
});
