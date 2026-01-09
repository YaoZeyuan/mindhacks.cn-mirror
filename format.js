// scripts/rewrite-html.js
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const Base_Input_Dir = path.join(__dirname, "raw_docs_原始数据勿动", "posts");
const Base_Output_Dir = path.join(__dirname, "docs", "posts");
const ASSETS_DIR = path.join(Base_Output_Dir, "..", "assets");

await fs.ensureDir(Base_Output_Dir);
await fs.ensureDir(ASSETS_DIR);

const ASSET_PREFIX = "../assets";
const SITE_HOST = "mindhacks.cn";

/**
 * 从 Wayback URL 中提取原始 URL
 */
function unwrapWayback(url) {
  if (!url) return url;

  // //web.archive.org/web/xxxx/http://...
  const m1 = url.match(
    /web\.archive\.org\/web\/\d+(?:[a-z_]+)?\/(https?:\/\/.+)$/
  );
  if (m1) return m1[1];

  // https://web.archive.org/web/.../http://...
  const m2 = url.match(/\/web\/\d+(?:[a-z_]+)?\/(https?:\/\/.+)$/);
  if (m2) return m2[1];

  return url;
}

/**
 * 将站内资源映射到本地 assets
 */
function mapToLocal(url) {
  try {
    const u = new URL(url);
    if (u.hostname === SITE_HOST) {
      return ASSET_PREFIX + u.pathname + u.search;
    }
  } catch {
    // ignore
  }
  return url;
}

/**
 * 处理单个 HTML 文件
 */
function processHtml(inputPath, outputPath) {
  const html = fs.readFileSync(inputPath, "utf8");
  const $ = cheerio.load(html, { decodeEntities: false });

  /** 1️⃣ 移除 Wayback 注入的脚本 / 样式 */
  $('script[src*="archive.org"]').remove();
  $('script:contains("__wm")').remove();
  $('link[href*="web-static.archive.org"]').remove();
  $('link[href*="iconochive"]').remove();
  $('link[href*="banner-styles"]').remove();

  /** 2️⃣ 处理 link / script / img / a */
  const ATTRS = ["href", "src"];

  ATTRS.forEach((attr) => {
    `[${attr}]`.split(",").forEach(() => {
      $(`[${attr}]`).each((_, el) => {
        let val = $(el).attr(attr);
        if (!val) return;

        // //xxx → https://xxx
        if (val.startsWith("//")) {
          val = "https:" + val;
        }

        val = unwrapWayback(val);
        val = mapToLocal(val);

        $(el).attr(attr, val);
      });
    });
  });

  /** 3️⃣ 清理 pingback / xmlrpc / api */
  $('link[href*="xmlrpc.php"]').remove();
  $('link[href*="wp-json"]').remove();

  fs.writeFileSync(outputPath, $.html(), "utf8");
}

function getPostLinks() {
  const postLink = [
    "_2006_10_15_cantor-godel-turing-an-eternal-golden-diagonal_康托尔、哥德尔、图灵&mdash;&mdash;永恒的金色对角线(rev#2).html",
    "_2007_05_24_learn-to-focus_学习密度与专注力.html",
    "_2007_12_02_probability-theory-in-evolution_数学之美番外篇：进化论中的概率论.html",
    "_2008_03_03_failing-to-see-the-big-picture_Failing To See the Big Picture Mistakes we make when learning programming.html",
    "_2008_04_08_reading-method_阅读与思考.html",
    "_2008_04_18_learning-from-polya_跟波利亚学解题_rev_3.html",
    "_2008_06_05_how-memory-works_学习与记忆.html",
    "_2008_06_13_why-is-quicksort-so-quick_数学之美番外篇：快排为什么那样快.html",
    "_2008_07_07_the-importance-of-knowing-why_知其所以然（以算法学习为例）.html",
    "_2008_07_08_learning-habits-part1_一直以来伴随我的一些学习习惯(一)：学习与思考.html",
    "_2008_07_20_learning-habits-part2_一直以来伴随我的一些学习习惯(二)：时间管理.html",
    "_2008_09_11_machine-learning-and-ai-resources_机器学习与人工智能学习资源导引.html",
    "_2008_09_17_learning-habits-part3_一直以来伴随我的一些学习习惯(三)：阅读方法.html",
    "_2008_09_21_the-magical-bayesian-method_数学之美番外篇：平凡而又神奇的贝叶斯方法.html",
    "_2008_10_29_methodology-for-programmers_方法论、方法论&mdash;&mdash;程序员的阿喀琉斯之踵.html",
    "_2008_12_05_learning-habits-part4_一直以来伴随我的一些学习习惯(四)：知识结构.html",
    "_2008_12_18_how-to-think-straight_如何清晰地思考（近一年来业余阅读的关于思维方面的知识结构整理）.html",
    "_2009_01_14_make-yourself-irreplacable_什么才是你的不可替代性和核心竞争力.html",
    "_2009_01_16_hammers-and-nails_锤子和钉子.html",
    "_2009_01_18_escape-from-your-shawshank-part1_逃出你的肖申克（一）：为什么一定要亲身经历了之后才能明白？.html",
    "_2009_02_07_better-explained-conflicts-in-intimate-relationship_[BetterExplained]亲密关系中的冲突解决.html",
    "_2009_02_07_independence-day_独立日.html",
    "_2009_02_09_writing-is-better-thinking_[BetterExplained]书写是为了更好的思考.html",
    "_2009_02_15_why-you-should-start-blogging-now_[BetterExplained]为什么你应该（从现在开始就）写博客.html",
    "_2009_03_09_first-principles-of-programming_编程的首要原则(s)是什么？.html",
    "_2009_03_15_preconception-explained_逃出你的肖申克（二）：仁者见仁智者见智？从视觉错觉到偏见.html",
    "_2009_03_28_effective-learning-and-memorization_[BetterExplained]如何有效地记忆与学习.html",
    "_2009_05_17_seven-years-in-nju_我在南大的七年.html",
    "_2009_07_06_why-you-should-do-it-yourself_[BetterExplained]遇到问题为什么应该自己动手.html",
    "_2009_10_05_im-a-tiny-bird-book-review_不是书评 ：《我是一只IT小小鸟》.html",
    "_2009_12_20_dark-time_暗时间.html",
    "_2010_03_18_escape-from-your-shawshank-part3_逃出你的肖申克（三）：遇见20万年前的自己.html",
    "_2010_11_14_the-importance-of-knowing-why-part2_知其所以然（续）.html",
    "_2011_01_23_escape-from-your-shawshank-4_逃出你的肖申克（四）：理智与情感.html",
    "_2011_07_10_the-importance-of-knowing-why-part3_知其所以然（三）：为什么算法这么难？.html",
    "_2011_11_04_how-to-interview-a-person-for-two-years_怎样花两年时间去面试一个人.html",
    "_2012_06_04_escape-from-your-shawshank-part5-the-invisible-cage_逃出你的肖申克（五）：看不见的牢笼（上）.html",
    "_2012_08_27_modern-cpp-practices_C++11（及现代C++风格）和快速迭代式开发.html",
    "_2015_01_27_escape-from-your-shawshank-part5-2-platos-cave_逃出你的肖申克（六）：看不见的牢笼（下）：柏拉图的洞穴.html",
    "_2016_12_01_independent-reading-part1_信息时代的独立阅读者（一）：内心的小声音.html",
    "_2016_12_01_independent-reading-part2_信息时代的独立阅读者（二）：怎么阅读科普类文章.html",
    "_2016_12_18_escape-from-your-shawshank-part7-science-of-change_逃出你的肖申克（七）：改变的科学和科学的改变.html",
    "_2017_04_29_through-the-maze-1_心智探寻（一）：父母，和我们自己.html",
    "_2017_10_17_through-the-maze-11_心智探寻（十一）：为什么很努力，却似乎停在原地.html",
  ];
  return postLink;
}

/**
 * 主流程
 */
const asyncMain = async () => {
  const posts = await getPostLinks();
  console.log(`发现文章 ${posts.length} 篇`);

  const indexHtmlList = ['<ul class="car-list">'];
  let index = 0;
  for (const postFile of posts) {
    console.log(`开始处理${postFile}`);
    index++;
    const inputFile = path.resolve(Base_Input_Dir, postFile);
    const outputFile = path.resolve(Base_Output_Dir, postFile);
    processHtml(inputFile, outputFile);
    console.log(`✔ Processed: ${outputFile}`);
    const title = postFile.split("_").slice(5).join("").split(".html")[0];
    const url = `https://mindhacks-mirror.yaozeyuan.online/posts/` + postFile;
    indexHtmlList.push(
      ` <li>
                      <span class="car-yearmonth"
                        > <span title="Post Count"></span></span
                      >
                      <ul class="car-monthlisting">
                        <li>
                          ${index}:
                          <a
                            href="${url}"
                            >${title}</a
                          >
                          <span title="Comment Count"></span>
                        </li>
                      </ul>
                    </li>
      `
    );
  }

  indexHtmlList.push("</ul>");
  const indexHtmlContent = indexHtmlList.join("\n");
  console.log(indexHtmlContent);
  console.log("✅ 完成");
};

asyncMain();
