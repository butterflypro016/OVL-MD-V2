const axios = require("axios");
const cheerio = require("cheerio");
const cookie = require("cookie");

const ytdl = async (input, format = 'video') => {
  try {
    const baseURL = 'https://you-tube-dl-psi.vercel.app/youtube';
    const response = await axios.get(baseURL, {
      params: {
        url: input,
        format: format
      }
    });
    if (!response.data || !response.data.status) return null;
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération via Vercel:', error.message);
    return null;
  }
};

async function fbdl(url) {
  try {
    const payload = {
      id: url,
      locale: 'en'
    };

    const response = await axios.post('https://getmyfb.com/process', new URLSearchParams(payload), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'user-agent': 'GoogleBot'
  },
    });

    const $ = cheerio.load(response.data);
 
    const firstDownloadLink = $('.results-list-item a').first().attr('href');

    if (firstDownloadLink) {
      return firstDownloadLink;
    } else {
      return "Aucun lien de téléchargement trouvé.";
    }
  } catch (err) {
    return `Erreur : ${err.message}`;
  }
}

async function ttdl(videoUrl) {
    let tries = 0;
    let lastError;

    while (tries < 5) {
        try {
            const response = await axios.get("https://ssstik.io/fr", {
                headers: {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
                    "user-agent": "GoogleBot",
                },
                maxRedirects: 5,
            });

            const cookies = response.headers["set-cookie"] || [];
            const initialCookies = cookies
                .map((cookieStr) => cookie.parse(cookieStr))
                .reduce((acc, curr) => ({ ...acc, ...curr }), {});

            const $page = cheerio.load(response.data);
            const token = $page("#token").attr("value");

            const sessionCookies = Object.entries({
                __cfduid: initialCookies.__cfduid || "",
                PHPSESSID: initialCookies.PHPSESSID || "",
            })
                .map(([key, value]) => cookie.serialize(key, value))
                .join("; ");

            const { data: html } = await axios.post(
                "https://ssstik.io/abc?url=dl",
                new URLSearchParams({ id: videoUrl, locale: "fr", tt: token }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
                        "cookie": sessionCookies,
                        "User-Agent": "GoogleBot",
                    },
                }
            );

            const $result = cheerio.load(html);

            const noWatermark = $result("a.download_link.without_watermark").attr("href")
                || $result("a.slides_video").attr("href")
                || null;
          
            const mp3 = $result("a.download_link.music").attr("href") || null;

            const slides = [];
            $result("a.download_link.slide").each((_, el) => {
                const href = $result(el).attr("href");
                if (href) slides.push(href);
            });

            const links = {
                noWatermark,
                mp3,
                slides
            };

            console.log(links);
            return links;

        } catch (err) {
            lastError = err;
            tries++;
            if (tries < 5) await new Promise(res => setTimeout(res, 1000));
        }
    }

    throw new Error(`Échec après 5 tentatives : ${lastError}`);
}

async function igdl(url, maxRetries = 5) {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      attempts++;
      const response = await axios.get("https://downloadgram.org/", {
        headers: {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "en-US,en;q=0.9,id;q=0.8",
          "user-agent": "GoogleBot",
        },
        maxRedirects: 5,
      });

      const cookies = response.headers["set-cookie"] || [];
      const initialCookies = cookies
        .map((cookieStr) => cookie.parse(cookieStr))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {});

      const $ = cheerio.load(response.data);
      const token = $("#token").attr("value");

      const sessionCookies = Object.entries({
        __cfduid: initialCookies.__cfduid || "",
        PHPSESSID: initialCookies.PHPSESSID || "",
      })
        .map(([key, value]) => cookie.serialize(key, value))
        .join("; ");

      const videoResponse = await axios.post(
        "https://api.downloadgram.org/media",
        new URLSearchParams({
          url: url,
          v: "3",
          lang: "en",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": "GoogleBot",
            "cookie": sessionCookies,
          },
        }
      );

      const videoPage = cheerio.load(videoResponse.data);
      let videoLink = videoPage("video source").attr("src");

      if (videoLink) {
        videoLink = videoLink.replace(/^\\\"|\\\"$/g, "");
        return { status: videoResponse.status, result: { video: videoLink } };
      } else {
        throw new Error("Lien de vidéo introuvable.");
      }
    } catch (error) {
      if (attempts >= maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

async function twitterdl(url, maxRetries = 5) {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      attempts++;
       const response = await axios.get(`https://twitsave.com/info?url=${url}`, {
        headers: {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "en-US,en;q=0.9,id;q=0.8",
          "user-agent": "GoogleBot",
        },
      });

      const $ = cheerio.load(response.data);
      const videoLink = $("video").attr("src");

      if (videoLink) {
        return { status: response.status, result: { video: videoLink } };
      } else {
        throw new Error("Lien vidéo introuvable.");
      }
    } catch (error) {
      if (attempts >= maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

async function apkdl(query, limit = 1) {
  const { data } = await axios.get("https://ws75.aptoide.com/api/7/apps/search", {
    params: { query, limit },
    headers: {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      "User-Agent": "GoogleBot"
    }
  });

  const list = data?.datalist?.list || [];
  return list.map(app => ({
    name: app.name,
    icon: app.icon,
    size: formatSize(app.file?.filesize),
    dllink: app.file?.path,
    package: app.package,
    lastup: app.updated || "N/A"
  }));
}

function formatSize(bytes) {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(2) + " MB";
}

module.exports = { fbdl, ttdl, igdl, twitterdl, ytdl, apkdl };
