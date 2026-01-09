import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { SocksProxyAgent } from "socks-proxy-agent";
const agent = new SocksProxyAgent("socks5h://127.0.0.1:1080");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const http = axios.create({
  timeout: 1000 * 30,
  httpsAgent: agent,
  httpAgent: agent,
  headers: {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    pragma: "no-cache",
    priority: "u=0, i",
    "sec-ch-ua":
      '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    cookie:
      "wb-cdx-ui-SERVER=wwwb-app205; donation-identifier=ac4fe6169fedb1087efe577a66340de4; wb-p-SERVER=wwwb-app227",
  },
});

const SNAPSHOT = "20160815001413";
const ARCHIVE_ROOT = "https://web.archive.org/web/" + SNAPSHOT + "/";
const ENTRY = ARCHIVE_ROOT + "http://mindhacks.cn/archives/";

const OUTPUT = path.join(__dirname, "docs");
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
  // console.log("entry => ", ENTRY)
  // const htmlRes = await http.get(ENTRY)
  // console.log("fetch success")
  // const html = htmlRes.data;
  // const $ = cheerio.load(html);

  // const links = new Set();

  // $("a").each((_, a) => {
  //   const href = $(a).attr("href");
  //   if (!href) return;

  //   if (href.includes("/archives/") && href.endsWith(".html")) {
  //     links.add(href.replace(/^\/+/, ""));
  //   }
  // });
  const postLinks = [
    {
      href: "https://web.archive.org/web/20230401033423/http://mindhacks.cn/2017/10/17/through-the-maze-11/",
      title: "心智探寻（十一）：为什么很努力，却似乎停在原地",
    },
    {
      href: "https://web.archive.org/web/20230401033423/http://mindhacks.cn/2017/04/29/through-the-maze-1/",
      title: "心智探寻（一）：父母，和我们自己",
    },
    {
      href: "https://web.archive.org/web/20230401033423/http://mindhacks.cn/2016/12/18/escape-from-your-shawshank-part7-science-of-change/",
      title: "逃出你的肖申克（七）：改变的科学和科学的改变",
    },
    {
      href: "https://web.archive.org/web/20230401033423/http://mindhacks.cn/2016/12/01/independent-reading-part2/",
      title: "信息时代的独立阅读者（二）：怎么阅读科普类文章",
    },
    {
      href: "https://web.archive.org/web/20230401033423/http://mindhacks.cn/2016/12/01/independent-reading-part1/",
      title: "信息时代的独立阅读者（一）：内心的小声音",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2015/01/27/escape-from-your-shawshank-part5-2-platos-cave/",
      title: "逃出你的肖申克（六）：看不见的牢笼（下）：柏拉图的洞穴",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2012/08/27/modern-cpp-practices/",
      title: "C++11（及现代C++风格）和快速迭代式开发",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2012/06/04/escape-from-your-shawshank-part5-the-invisible-cage/",
      title: "逃出你的肖申克（五）：看不见的牢笼（上）",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2011/11/04/how-to-interview-a-person-for-two-years/",
      title: "怎样花两年时间去面试一个人",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2011/07/10/the-importance-of-knowing-why-part3/",
      title: "知其所以然（三）：为什么算法这么难？",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2011/01/23/escape-from-your-shawshank-4/",
      title: "逃出你的肖申克（四）：理智与情感",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2010/11/14/the-importance-of-knowing-why-part2/",
      title: "知其所以然（续）",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2010/03/18/escape-from-your-shawshank-part3/",
      title: "逃出你的肖申克（三）：遇见20万年前的自己",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/12/20/dark-time/",
      title: "暗时间",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/10/05/im-a-tiny-bird-book-review/",
      title: "不是书评 ：《我是一只IT小小鸟》",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/07/06/why-you-should-do-it-yourself/",
      title: "[BetterExplained]遇到问题为什么应该自己动手",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/05/17/seven-years-in-nju/",
      title: "我在南大的七年",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/03/28/effective-learning-and-memorization/",
      title: "[BetterExplained]如何有效地记忆与学习",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/03/15/preconception-explained/",
      title: "逃出你的肖申克（二）：仁者见仁智者见智？从视觉错觉到偏见",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/03/09/first-principles-of-programming/",
      title: "编程的首要原则(s)是什么？",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/02/15/why-you-should-start-blogging-now/",
      title: "[BetterExplained]为什么你应该（从现在开始就）写博客",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/02/09/writing-is-better-thinking/",
      title: "[BetterExplained]书写是为了更好的思考",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/02/07/independence-day/",
      title: "独立日",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/02/07/better-explained-conflicts-in-intimate-relationship/",
      title: "[BetterExplained]亲密关系中的冲突解决",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/01/18/escape-from-your-shawshank-part1/",
      title: "逃出你的肖申克（一）：为什么一定要亲身经历了之后才能明白？",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/01/16/hammers-and-nails/",
      title: "锤子和钉子",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2009/01/14/make-yourself-irreplacable/",
      title: "什么才是你的不可替代性和核心竞争力",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/12/18/how-to-think-straight/",
      title: "如何清晰地思考（近一年来业余阅读的关于思维方面的知识结构整理）",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/12/05/learning-habits-part4/",
      title: "一直以来伴随我的一些学习习惯(四)：知识结构",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/10/29/methodology-for-programmers/",
      title: "方法论、方法论&mdash;&mdash;程序员的阿喀琉斯之踵",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/09/21/the-magical-bayesian-method/",
      title: "数学之美番外篇：平凡而又神奇的贝叶斯方法",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/09/17/learning-habits-part3/",
      title: "一直以来伴随我的一些学习习惯(三)：阅读方法",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/09/11/machine-learning-and-ai-resources/",
      title: "机器学习与人工智能学习资源导引",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/07/20/learning-habits-part2/",
      title: "一直以来伴随我的一些学习习惯(二)：时间管理",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/07/08/learning-habits-part1/",
      title: "一直以来伴随我的一些学习习惯(一)：学习与思考",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/07/07/the-importance-of-knowing-why/",
      title: "知其所以然（以算法学习为例）",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/06/13/why-is-quicksort-so-quick/",
      title: "数学之美番外篇：快排为什么那样快",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/06/05/how-memory-works/",
      title: "学习与记忆",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/04/18/learning-from-polya/",
      title: "跟波利亚学解题(rev#3)",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/04/08/reading-method/",
      title: "阅读与思考",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2008/03/03/failing-to-see-the-big-picture/",
      title:
        "Failing To See the Big Picture &#8211; Mistakes we make when learning programming",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2007/12/02/probability-theory-in-evolution/",
      title: "数学之美番外篇：进化论中的概率论",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2007/05/24/learn-to-focus/",
      title: "学习密度与专注力",
    },
    {
      href: "https://web.archive.org/web/20160815001413/http://mindhacks.cn/2006/10/15/cantor-godel-turing-an-eternal-golden-diagonal/",
      title: "康托尔、哥德尔、图灵&mdash;&mdash;永恒的金色对角线(rev#2)",
    },
  ];

  return postLinks;
}

/**
 * 抓文章并本地化资源
 */
async function fetchPost(postConfig) {
  const title = postConfig.title;
  const url = postConfig.href;
  console.log("📄", title, " => ", url);

  const html = (await http.get(url)).data;
  const $ = cheerio.load(html);

  // 处理资源
  const resources = [];

  $("img[src]").each((_, el) => {
    const attr = el.tagName === "link" ? "href" : "src";

    const val = $(el).attr(attr);
    if (!val) return;

    if (val.includes("mindhacks.cn") === false) return;

    const abs = val;

    const localPath = val.split("mindhacks.cn")[1];

    const local = path.join("assets", localPath);
    $(el).attr(attr, "/" + local);

    resources.push({ abs, local });
  });

  // 下载资源
  for (const r of resources) {
    await download(r.abs, path.join(OUTPUT, r.local));
  }

  // 写 HTML
  const rawTimeStr = postConfig.href.split("mindhacks.cn")[1];
  const htmlTimeStr = rawTimeStr.replaceAll("/", "_");
  const htmlTitle = postConfig.title.replaceAll("/", "_");
  const outFile = path.join(POSTS_DIR, htmlTimeStr + htmlTitle + ".html");
  await fs.writeFile(outFile, $.html());
}

/**
 * 下载静态资源
 */
async function asyncDonwloadCss() {
  const resList = [
    `<link rel="stylesheet" id="wp-pagenavi-css" href="https://web.archive.org/web/20160807020105cs_/http://mindhacks.cn/wp-content/plugins/wp-pagenavi/pagenavi-css.css?ver=2.70" type="text/css" media="all"/>`,
    `<script type="text/javascript" src="https://web.archive.org/web/20160807020105js_/http://mindhacks.cn/wp-includes/js/jquery/jquery.js?ver=1.4.2"></script>`,
    `<script type="text/javascript" src="https://web.archive.org/web/20160807020105js_/http://mindhacks.cn/wp-content/themes/arras/js/superfish/hoverIntent.js"></script>`,
    `<script type="text/javascript" src="https://web.archive.org/web/20160807020105js_/http://mindhacks.cn/wp-content/themes/arras/js/superfish/superfish.js"></script>`,
    `<script type="text/javascript" src="https://web.archive.org/web/20160807020105js_/http://mindhacks.cn/wp-content/themes/arras/js/jquery.validate.min.js"></script>`,
    `<link rel="stylesheet" type="text/css" href="https://web.archive.org/web/20160807020105cs_/http://mindhacks.cn/wp-content/plugins/wp-recaptcha/recaptcha.css"/><link rel="stylesheet" href="https://web.archive.org/web/20160807020105cs_/http://mindhacks.cn/wp-content/themes/arras/css/styles/default.css" type="text/css" media="screen,projection"/><link rel="stylesheet" href="https://web.archive.org/web/20160807020105cs_/http://mindhacks.cn/wp-content/themes/arras/css/layouts/2c-r-fixed.css" type="text/css"/>`,
    `<link rel="stylesheet" href="https://web.archive.org/web/20160807020105cs_/http://mindhacks.cn/wp-content/themes/arras-child/style.css" type="text/css" media="screen,projection"/>`,

    `<link rel="stylesheet" id="parent-theme-css-css" href="https://web.archive.org/web/20180201005218cs_/http://mindhacks.cn/wp-content/themes/lavish-pro/style.css?ver=4.7.9" type="text/css" media="all">`,
    `<link rel="stylesheet" id="lavish-bootstrap-css" href="https://web.archive.org/web/20180201005218cs_/http://mindhacks.cn/wp-content/themes/lavish-pro/css/bootstrap.min.css?ver=2018-02-01%2008:52:22" type="text/css" media="all">`,
    `<link rel="stylesheet" id="font-awesome-css" href="https://web.archive.org/web/20180201005218cs_/http://mindhacks.cn/wp-content/themes/lavish-pro/css/font-awesome.min.css?ver=1.0.0" type="text/css" media="all">`,
    `<link rel="stylesheet" id="lavish-woocommerce-css" href="https://web.archive.org/web/20180201005218cs_/http://mindhacks.cn/wp-content/themes/lavish-pro/css/woocommerce.css?ver=1.0.0" type="text/css" media="all">`,
    `<link rel="stylesheet" id="lavish_wow-css" href="https://web.archive.org/web/20180201005218cs_/http://mindhacks.cn/wp-content/themes/lavish-pro/css/animate.css?ver=1.0.0" type="text/css" media="all">`,
    `<link rel="stylesheet" id="lavish_style_portfolio-css" href="https://web.archive.org/web/20180201005218cs_/http://mindhacks.cn/wp-content/themes/lavish-pro/css/style_portfolio.css?ver=1.0.0" type="text/css" media="all">`,
    `<link rel="stylesheet" id="lavish-css" href="https://web.archive.org/web/20180201005218cs_/http://mindhacks.cn/wp-content/themes/lavish-pro/css/navmenu.css?ver=1.0.0" type="text/css" media="all">`,
    `<link rel="stylesheet" id="lavish-style-css" href="https://web.archive.org/web/20180201005218cs_/http://mindhacks.cn/wp-content/themes/lavish-pro-child/style.css?ver=1.0.0" type="text/css" media="all">`,
    `<script type="text/javascript" src="https://web.archive.org/web/20180201005218js_/http://mindhacks.cn/wp-includes/js/jquery/jquery.js?ver=1.12.4"></script>`,
    `<script type="text/javascript" src="https://web.archive.org/web/20180201005218js_/http://mindhacks.cn/wp-includes/js/jquery/jquery-migrate.min.js?ver=1.4.1"></script>`,
  ];

  const resources = [];
  console.log("开始下载静态资源");
  for (const res of resList) {
    let key = "";
    if (res.startsWith("<link")) {
      key = `href=`;
    } else {
      key = `src=`;
    }
    let url = res.split(key)[1].split('"')[1];
    url = url.split("?")[0]; // 去除query参数
    const abs = url;

    const localPath = url.split("mindhacks.cn")[1];

    const local = path.join("assets", localPath);

    resources.push({ abs, local });
  }

  // 下载资源
  for (const r of resources) {
    console.log("开始下载", r.local);
    await download(r.abs, path.join(OUTPUT, r.local));
  }
  console.log("下载完毕");
  return;
}

/**
 * 主流程
 */
const asyncMain = async () => {
  const posts = await getPostLinks();
  console.log(`发现文章 ${posts.length} 篇`);

  for (const config of posts) {
    await fetchPost(config);
  }

  console.log("✅ 完成");
};

// asyncMain();
asyncDonwloadCss();
