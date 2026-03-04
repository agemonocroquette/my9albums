require('dotenv').config();
// server.js
const express = require("express");
const fetch = require("node-fetch"); // Node 18+ なら不要で fetch 使える
const app = express();
const port = 3000;

// 環境変数に自分のSpotify Client ID/Secretを入れておくと安全
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// 静的ファイル配信
app.use(express.static("public")); // index.html, style.css は public フォルダに入れる

// Spotifyトークン取得用関数
async function getSpotifyToken() {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const data = await res.json();
  return data.access_token; // 有効時間は1時間
}

// Spotify検索API
app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "query missing" });

  try {
    const token = await getSpotifyToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Spotify API error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});