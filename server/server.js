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
app.use(cors());
// 解析 JSON 請求
app.use(express.json());

// 建立用戶資料表（如果資料表不存在）
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS players(
    id SERIAL PRIMARY KEY, -- id
    username VARCHAR(250) UNIQUE NOT NULL,
    password VARCHAR(250) NOT NULL,
    petname VARCHAR(250) DEFAULT 'Cutie',
    hp INTEGER DEFAULT 100,
    score INTEGER DEFAULT 0 NOT NULL
  );

  UPDATE players SET score = 0 WHERE score IS NULL;
  ALTER TABLE players DROP CONSTRAINT IF EXISTS players_petname_key;
  DELETE FROM players WHERE username = "";
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
  const { username, password } = req.body;

  try {
    const userCheck = await client.query(
      'SELECT * FROM players WHERE username = $1', [username]
    );

    if (userCheck.rows.length > 0) {
      return res.status(200).json({ message: 'Login successfully', user: userCheck.rows[0] });
    }

    const result = await client.query(
      'INSERT INTO players (username, password, petname, hp, score) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, password, 'Cutie', 100, 0]
    );

    res.status(201).json({ message: 'Account created', user: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating account' });
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
  const { username, score } = req.body;
  try {
    await client.query('UPDATE players SET score = score + $1 WHERE username = $2', [score, username]);
    res.json({ message: 'Score updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update score' });
  }
});

// 獲取排行榜
app.get('/leaderboard', async (req, res) => {
    try {
        const result = await client.query('SELECT username, hp, score FROM players ORDER BY score DESC');
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
