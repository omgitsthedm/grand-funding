#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

function decodeEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function textContent(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function metaContent(html, key) {
  const patterns = [
    new RegExp(
      `<meta\\b[^>]*(?:name|property)=["']${key}["'][^>]*content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta\\b[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["']${key}["'][^>]*>`,
      "i",
    ),
  ];
  return patterns.map(pattern => pattern.exec(html)?.[1]).find(Boolean) || "";
}

function canonicalUrl(html) {
  return (
    /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i.exec(html)?.[1] ||
    /<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i.exec(html)?.[1] ||
    ""
  );
}

function publishedDate(html, stat) {
  const raw =
    metaContent(html, "article:published_time") ||
    /<time\b[^>]*datetime=["']([^"']+)["']/i.exec(html)?.[1] ||
    "";
  const date = raw ? new Date(raw) : stat.mtime;
  return Number.isNaN(date.getTime()) ? stat.mtime : date;
}

function neutralFeedDescription(title) {
  const topic = title
    .replace(/\s*[|–—-]\s*Grand Funding(?: LLC)?\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (/\sGuide$/i.test(topic)) {
    return `Practical context for ${topic.replace(/\sGuide$/i, "")}, from Grand Funding.`;
  }
  return `A Grand Funding investor guide to ${topic}.`;
}

export async function generateRss({ dist, siteOrigin }) {
  const postsDirectory = path.join(dist, "posts");
  const names = (await fs.readdir(postsDirectory))
    .filter(name => name.endsWith(".html"))
    .sort();

  const posts = [];
  for (const name of names) {
    const file = path.join(postsDirectory, name);
    const [html, stat] = await Promise.all([fs.readFile(file, "utf8"), fs.stat(file)]);
    const canonical = canonicalUrl(html);
    const title = textContent(/<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || "");
    if (!canonical || !title) {
      throw new Error(`RSS contract failed for posts/${name}`);
    }
    posts.push({
      canonical,
      description: neutralFeedDescription(title),
      published: publishedDate(html, stat),
      title,
    });
  }

  posts.sort((a, b) => b.published.getTime() - a.published.getTime());
  const origin = siteOrigin.replace(/\/+$/, "");
  const latest = posts[0]?.published || new Date("2026-07-25T00:00:00Z");
  const items = posts
    .map(
      post => [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(post.canonical)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(post.canonical)}</guid>`,
        `      <pubDate>${post.published.toUTCString()}</pubDate>`,
        `      <description>${escapeXml(post.description)}</description>`,
        "    </item>",
      ].join("\n"),
    )
    .join("\n");

  const feed = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>Grand Funding Investor Guides</title>",
    `    <link>${origin}/blog</link>`,
    "    <description>Practical private-lending and real-estate-investor guides from Grand Funding LLC.</description>",
    "    <language>en-us</language>",
    `    <lastBuildDate>${latest.toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml"/>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  await fs.writeFile(path.join(dist, "feed.xml"), feed);
  return posts.length;
}
