export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {

  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  const query = req.query.q;
  const type = req.query.type || "album";

  try {

    const basic = Buffer.from(
      CLIENT_ID + ":" + CLIENT_SECRET
    ).toString("base64");

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    const tokenData = await tokenRes.json();

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=6`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      }
    );

    const data = await searchRes.json();

    res.status(200).json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Spotify API error",
      message: err.message
    });

  }

}