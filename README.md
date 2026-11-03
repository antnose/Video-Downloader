# Reels to Audio (local)

Paste a Facebook Reel link, click **Convert**, and an MP3 downloads automatically.
Runs only on your own machine (bound to 127.0.0.1).

## Requirements

1. **Node.js** 18+
2. **yt-dlp** (does the downloading)
3. **ffmpeg** (extracts/converts the audio to MP3)

### Install yt-dlp and ffmpeg

- Windows (winget): `winget install yt-dlp.yt-dlp` and `winget install Gyan.FFmpeg`
- macOS (Homebrew): `brew install yt-dlp ffmpeg`
- Linux: `pip install -U yt-dlp` and `sudo apt install ffmpeg`

Check both work in a terminal: `yt-dlp --version` and `ffmpeg -version`
(restart the terminal after installing so PATH updates).

## Run

```bash
npm install
npm start
```

Open http://localhost:3000, paste the link, press Convert.

## Notes

- Only public Reels work. Private or login-only videos will fail.
- If conversions suddenly stop working, update yt-dlp: `yt-dlp -U`
- Only download content you have the right to use, and respect creators and Facebook's terms.
