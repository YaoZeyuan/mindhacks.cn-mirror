import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const proxyConfig = {
  protocol: 'http',
  host:"127.0.0.1",
  port:1080
}
const http = axios.create({
  proxy:proxyConfig
})

const SNAPSHOT = "20160826175025";
const ARCHIVE_ROOT =
  "https://web.archive.org/web/" + SNAPSHOT + "/";
const ENTRY =
  ARCHIVE_ROOT + "http://mindhacks.cn/archives/";

const OUTPUT = path.join(__dirname, "..", "docs");
const POSTS_DIR = path.join(OUTPUT, "posts");
const ASSETS_DIR = path.join(OUTPUT, "assets");

await fs.ensureDir(POSTS_DIR);
await fs.ensureDir(ASSETS_DIR);

/**
 * 下载文件
 */
async function download(url, localPath) {
  if (await fs.pathExists(localPath)) return;

  console.log("↓", url);
  const res = await http.get(url, { responseType: "arraybuffer" });
  await fs.ensureDir(path.dirname(localPath));
  await fs.writeFile(localPath, res.data);
}

/**
 * 抓 archives 页面，提取文章链接
 */
async function getPostLinks() {
  const html = (await http.get(ENTRY)).data;
  const $ = cheerio.load(html);

  const links = new Set();

  $("a").each((_, a) => {
    const href = $(a).attr("href");
    if (!href) return;

    if (href.includes("/archives/") && href.endsWith(".html")) {
      links.add(href.replace(/^\/+/, ""));
    }
  });

  return [...links];
}

/**
 * 抓文章并本地化资源
 */
async function fetchPost(postPath) {
  const url = ARCHIVE_ROOT + "http://mindhacks.cn/" + postPath;
  console.log("📄", url);

  const html = (await http.get(url)).data;
  const $ = cheerio.load(html);

  // 处理资源
  const resources = [];

  $("link[href], script[src], img[src]").each((_, el) => {
    const attr =
      el.tagName === "link"
        ? "href"
        : "src";

    const val = $(el).attr(attr);
    if (!val) return;

    if (val.startsWith("http")) return;

    const abs =
      ARCHIVE_ROOT +
      "http://mindhacks.cn" +
      val.replace(/^\/+/, "");

    const local = path.join("assets", val);
    $(el).attr(attr, "/" + local);

    resources.push({ abs, local });
  });

  // 下载资源
  for (const r of resources) {
    await download(
      r.abs,
      path.join(OUTPUT, r.local)
    );
  }

  // 写 HTML
  const outFile = path.join(POSTS_DIR, path.basename(postPath));
  await fs.writeFile(outFile, $.html());
}

/**
 * 主流程
 */
(async () => {
  const posts = await getPostLinks();
  console.log(`发现文章 ${posts.length} 篇`);

  for (const p of posts) {
    await fetchPost(p);
  }

  console.log("✅ 完成");
})();
