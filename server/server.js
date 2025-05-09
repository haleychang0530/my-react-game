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

// 允許來自(所有)前端網站的請求
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
  ALTER TABLE players ADD COLUMN IF NOT EXISTS rfid VARCHAR(255) UNIQUE;
  ALTER TABLE players ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;
  ALTER TABLE players ADD COLUMN IF NOT EXISTS timespan INT DEFAULT 0;
  ALTER TABLE players DROP CONSTRAINT IF EXISTS players_petname_key;
  DELETE FROM players WHERE username = '';
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
  const { username, password, rfid } = req.body;

  try {
    const userCheck = await client.query(
      'SELECT * FROM players WHERE username = $1', [username]
    );
    if (userCheck.rows.length > 0) {
      await client.query(
        'UPDATE players SET is_online = TRUE WHERE username = $1',
        [username]
      );
      return res.status(200).json({ message: 'Login successfully', user: userCheck.rows[0] });
    }
    
    const result = await client.query(
      'INSERT INTO players (username, password, petname, hp, score, rfid, timespan) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [username, password, 'Cutie', 100, 0, rfid, 0]
    );
    await client.query(
      'UPDATE players SET is_online = TRUE WHERE username = $1',
      [username]
    );
    res.status(201).json({ message: 'Account created', user: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating account' });
  }
});

//現有帳號綁定rfid用
app.post('/updateRfid', async (req, res) => {
  const { username, rfid } = req.body;
  try {
    
    const userCheck = await client.query(
      'SELECT * FROM players WHERE username = $1', [username]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const result = await client.query(
      'UPDATE players SET rfid = $1 WHERE username = $2 RETURNING *',
      [rfid, username]
    );
    
    res.status(200).json({ message: 'RFID set successfully', user: result.rows[0] });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error setting RFID' });
  }
});

// 取得帳號&血量狀態
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
        const result = await client.query('SELECT username, hp, score, timespan FROM players ORDER BY score DESC');
        res.json(result.rows);
      
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//僅用 Rfid 登入
app.post('/loginWithRfid', async (req, res) => {
  const { rfid } = req.body;
  try {
    const result = await client.query(
      'SELECT * FROM players WHERE rfid = $1 ',
      [rfid]
    );
    if (result.rows.length > 0) {
      await client.query(
        'UPDATE players SET is_online = TRUE WHERE rfid = $1',
        [rfid]
      );
      res.status(200).json({ message: 'Login with RFID successful', rfid: result.rows[0] });
    } else {
      res.status(404).json({ error: 'RFID not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/testingData', async (req, res) => {
    try {
        const result = await client.query('SELECT username, hp, score , password, rfid, timespan , is_online FROM players ORDER BY score DESC');
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//登出
app.post('/logout', async (req, res) => {
  const { username } = req.body;
  try {
    const result = await client.query(
      'UPDATE players SET is_online = FALSE WHERE username = $1',
      [username]
    );
    if (result.rows.length > 0) {
      res.status(200).json({ message: 'Logout successful', user: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Logout Failed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 設定帳號刪除
app.post('/deleteAccount', async (req, res) => {
  const { username } = req.body;
  try {
      const result = await client.query(
          'DELETE FROM players WHERE username = $1',
          [username]
      );
      if (result.rowCount > 0) {
        res.status(200).json({ message: 'Good night' });
      } else {
        res.status(404).json({ error: 'Player not found' });
      }
  } catch (err) {
      console.log(err);
      res.status(404).json({ error: 'Player not found' });
    }
  });

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is running at PORT:${port}`);
  console.log(`Server is running at http://localhost:${port}`);
});

setInterval(async () => {
  try {
    await client.query('UPDATE players SET timespan = timespan + 1 WHERE is_online = TRUE');
  } catch (err) {
    console.error('Error updating timespan :', err);
  }
}, 1000);