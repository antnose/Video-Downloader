// const express = require("express");
// const { execFile } = require("child_process");
// const fs = require("fs");
// const os = require("os");
// const path = require("path");

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(express.json());

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// function isFacebookUrl(value) {
//   try {
//     const u = new URL(value);
//     if (!["http:", "https:"].includes(u.protocol)) return false;
//     const host = u.hostname.toLowerCase();
//     return (
//       host === "fb.watch" ||
//       host === "facebook.com" ||
//       host.endsWith(".facebook.com")
//     );
//   } catch {
//     return false;
//   }
// }

// app.post("/convert", (req, res) => {
//   const url = (req.body && req.body.url ? String(req.body.url) : "").trim();

//   if (!isFacebookUrl(url)) {
//     return res.status(400).json({ error: "Please enter a valid Facebook Reel link." });
//   }

//   const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "reels-audio-"));
//   const cleanup = () => fs.rm(workDir, { recursive: true, force: true }, () => {});

//   const args = [
//     "-x",
//     "--audio-format", "mp3",
//     "--audio-quality", "0",
//     "--no-playlist",
//     "--restrict-filenames",
//     "-o", path.join(workDir, "%(id)s.%(ext)s"),
//     url,
//   ];

//   execFile("yt-dlp", args, { timeout: 120000 }, (err, stdout, stderr) => {
//     if (err) {
//       console.error(stderr || err.message);
//       cleanup();
//       const missing = err.code === "ENOENT";
//       return res.status(500).json({
//         error: missing
//           ? "yt-dlp is not installed or not on your PATH."
//           : "Could not convert this link. It may be private, removed, or need a login.",
//       });
//     }

//     const files = fs.readdirSync(workDir).filter((f) => f.endsWith(".mp3"));
//     if (files.length === 0) {
//       cleanup();
//       return res.status(500).json({ error: "Conversion finished but no audio file was produced." });
//     }

//     const filePath = path.join(workDir, files[0]);
//     res.download(filePath, "reel-audio.mp3", () => cleanup());
//   });
// });

// app.listen(PORT, "127.0.0.1", () => {
//   console.log(`Reels audio converter running at http://localhost:${PORT}`);
// });

// const express = require("express");
// const { execFile } = require("child_process");
// const fs = require("fs");
// const os = require("os");
// const path = require("path");

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(express.json());

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// const HOSTS = {
//   facebook: (h) =>
//     h === "fb.watch" || h === "facebook.com" || h.endsWith(".facebook.com"),
//   youtube: (h) =>
//     h === "youtu.be" || h === "youtube.com" || h.endsWith(".youtube.com"),
// };

// function isValidUrl(value, source) {
//   try {
//     const u = new URL(value);
//     if (!["http:", "https:"].includes(u.protocol)) return false;
//     const check = HOSTS[source];
//     return !!check && check(u.hostname.toLowerCase());
//   } catch {
//     return false;
//   }
// }

// app.post("/download", (req, res) => {
//   const body = req.body || {};
//   const url = (body.url ? String(body.url) : "").trim();
//   const source = String(body.source || "");
//   const format = String(body.format || "");

//   if (!HOSTS[source] || !["audio", "video"].includes(format)) {
//     return res.status(400).json({ error: "Invalid request." });
//   }

//   if (!isValidUrl(url, source)) {
//     return res.status(400).json({
//       error: `Please enter a valid ${source === "facebook" ? "Facebook" : "YouTube"} link.`,
//     });
//   }

//   const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "media-dl-"));
//   const cleanup = () =>
//     fs.rm(workDir, { recursive: true, force: true }, () => {});

//   const args = ["--no-playlist", "--restrict-filenames"];

//   if (format === "audio") {
//     args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
//   } else {
//     args.push(
//       "-f",
//       "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b",
//       "--merge-output-format",
//       "mp4",
//     );
//   }

//   args.push("-o", path.join(workDir, "%(title).80s.%(ext)s"), url);

//   // Video downloads can be big, so give them more time.
//   const timeout = format === "video" ? 600000 : 180000;

//   execFile(
//     "yt-dlp",
//     args,
//     { timeout, maxBuffer: 1024 * 1024 * 20 },
//     (err, stdout, stderr) => {
//       if (err) {
//         console.error(stderr || err.message);
//         cleanup();
//         if (err.code === "ENOENT") {
//           return res
//             .status(500)
//             .json({ error: "yt-dlp is not installed or not on your PATH." });
//         }
//         return res.status(500).json({
//           error:
//             "Could not download this link. It may be private, removed, age-restricted, or need a login.",
//         });
//       }

//       const ext = format === "audio" ? ".mp3" : ".mp4";
//       const files = fs.readdirSync(workDir).filter((f) => f.endsWith(ext));
//       if (files.length === 0) {
//         cleanup();
//         return res
//           .status(500)
//           .json({ error: "Finished, but no file was produced." });
//       }

//       const filePath = path.join(workDir, files[0]);
//       res.download(filePath, files[0], () => cleanup());
//     },
//   );
// });

// app.listen(PORT, "127.0.0.1", () => {
//   console.log(`Downloader running at http://localhost:${PORT}`);
// });

const express = require("express");
const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const SAVE_DIR = path.join(__dirname, "downloads");

fs.mkdirSync(SAVE_DIR, { recursive: true });

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const HOSTS = {
  facebook: (h) =>
    h === "fb.watch" || h === "facebook.com" || h.endsWith(".facebook.com"),
  youtube: (h) =>
    h === "youtu.be" || h === "youtube.com" || h.endsWith(".youtube.com"),
};

function detectSource(value) {
  try {
    const u = new URL(value);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    const host = u.hostname.toLowerCase();
    for (const [name, check] of Object.entries(HOSTS)) {
      if (check(host)) return name;
    }
    return null;
  } catch {
    return null;
  }
}

function isValidUrl(value, source) {
  return !!HOSTS[source] && detectSource(value) === source;
}

// Runs yt-dlp into a temp folder. Calls done(errorMessage | null, filePath, cleanup)
function runYtDlp(url, format, done) {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "media-dl-"));
  const cleanup = () =>
    fs.rm(workDir, { recursive: true, force: true }, () => {});

  const args = ["--no-playlist", "--restrict-filenames"];

  if (format === "audio") {
    args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
  } else {
    args.push(
      "-f",
      "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b",
      "--merge-output-format",
      "mp4",
    );
  }

  args.push("-o", path.join(workDir, "%(title).80s.%(ext)s"), url);

  const timeout = format === "video" ? 600000 : 180000;

  execFile(
    "yt-dlp",
    args,
    { timeout, maxBuffer: 1024 * 1024 * 20 },
    (err, stdout, stderr) => {
      if (err) {
        console.error(stderr || err.message);
        cleanup();
        if (err.code === "ENOENT") {
          return done("yt-dlp is not installed or not on your PATH.");
        }
        return done(
          "Could not download this link. It may be private, removed, age-restricted, or need a login.",
        );
      }

      const ext = format === "audio" ? ".mp3" : ".mp4";
      const files = fs.readdirSync(workDir).filter((f) => f.endsWith(ext));
      if (files.length === 0) {
        cleanup();
        return done("Finished, but no file was produced.");
      }

      done(null, path.join(workDir, files[0]), cleanup);
    },
  );
}

// Sends the file to the browser (used by the single-row tabs)
app.post("/download", (req, res) => {
  const body = req.body || {};
  const url = (body.url ? String(body.url) : "").trim();
  const source = String(body.source || "");
  const format = String(body.format || "");

  if (!HOSTS[source] || !["audio", "video"].includes(format)) {
    return res.status(400).json({ error: "Invalid request." });
  }

  if (!isValidUrl(url, source)) {
    return res.status(400).json({
      error: `Please enter a valid ${source === "facebook" ? "Facebook" : "YouTube"} link.`,
    });
  }

  runYtDlp(url, format, (error, filePath, cleanup) => {
    if (error) return res.status(500).json({ error });
    res.download(filePath, path.basename(filePath), () => cleanup());
  });
});

// Saves the file straight into the "downloads" folder (used by Bulk tab).
// No browser download, so no browser permission prompts.
app.post("/save", (req, res) => {
  const body = req.body || {};
  const url = (body.url ? String(body.url) : "").trim();
  const format = body.format === "video" ? "video" : "audio";

  if (!detectSource(url)) {
    return res
      .status(400)
      .json({ error: "Not a valid Facebook or YouTube link." });
  }

  runYtDlp(url, format, (error, filePath, cleanup) => {
    if (error) return res.status(500).json({ error });

    try {
      const parsed = path.parse(filePath);
      let target = path.join(SAVE_DIR, parsed.base);
      let n = 1;
      while (fs.existsSync(target)) {
        target = path.join(SAVE_DIR, `${parsed.name} (${n++})${parsed.ext}`);
      }
      fs.copyFileSync(filePath, target);
      cleanup();
      res.json({ ok: true, file: path.basename(target) });
    } catch (e) {
      console.error(e);
      cleanup();
      res
        .status(500)
        .json({ error: "Could not save the file to the downloads folder." });
    }
  });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Downloader running at http://localhost:${PORT}`);
  console.log(`Bulk downloads are saved to: ${SAVE_DIR}`);
});
