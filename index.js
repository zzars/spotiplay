const express = require("express");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.set("trust proxy", true);
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", express.static(path.join(__dirname, "public")));

// Scraper By Nekolabs.
async function spotify(input) {
    try {
        if (!input) throw new Error("Input is required.");

        const { data: s } = await axios.get(
            `https://spotdown.org/api/song-details?url=${encodeURIComponent(
                input
            )}`,
            {
                headers: {
                    origin: "https://spotdown.org",
                    referer: "https://spotdown.org/",
                    "user-agent":
                        "Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36"
                }
            }
        );

        const song = s.songs[0];
        if (!song) throw new Error("Track not found.");

        return {
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            cover: song.thumbnail,
            url: song.url
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

// Scraper By Rynn from Nekolabs.
async function spotifydl(url) {
    try {
        if (!url.includes("open.spotify.com")) throw new Error("Invalid url.");

        const rynn = await axios.get("https://spotmate.online/", {
            headers: {
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        const $ = cheerio.load(rynn.data);

        const api = axios.create({
            baseURL: "https://spotmate.online",
            headers: {
                cookie: rynn.headers["set-cookie"].join("; "),
                "content-type": "application/json",
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "x-csrf-token": $('meta[name="csrf-token"]').attr("content")
            }
        });

        const [{ data: meta }, { data: dl }] = await Promise.all([
            api.post("/getTrackData", { spotify_url: url }),
            api.post("/convert", { urls: url })
        ]);

        return {
            ...meta,
            download_url: dl.url
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

app.get("/getmusicdata", async (req, res) => {
    const title = req.query.title;
    if (title) {
        try {
            const data1 = await spotify(title);
            const data2 = await spotifydl(data1.url);
            res.json({
                success: true,
                title: data1.title,
                cover: data1.cover,
                artist: data1.artist,
                raw_url: data1.url,
                download_url: data2.download_url
            });
        } catch (e) {
            res.json({
                success: false,
                error: "Internal Server Error"
            });
            console.log(e);
        }
    } else {
        console.log("Title not found.");
    }
});

module.exports = app;
