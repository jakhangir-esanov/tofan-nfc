import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const SCRIPT_KINDS = new Map([
  ['.ts', ts.ScriptKind.TS],
  ['.mts', ts.ScriptKind.TS],
  ['.js', ts.ScriptKind.JS],
  ['.mjs', ts.ScriptKind.JS],
  ['.cjs', ts.ScriptKind.JS],
]);
const JSON_FILES = new Set(['.json', '.prettierrc']);
const HASH_FILES = new Set([
  '.gitignore',
  '.editorconfig',
  '.prettierignore',
  '.dockerignore',
  '.npmrc',
  'Dockerfile',
]);
const HASH_EXTENSIONS = new Set(['.template', '.inc', '.conf']);
const SKIPPED_EXTENSIONS = new Set([
  '.md',
  '.png',
  '.ico',
  '.svg',
  '.jpg',
  '.jpeg',
  '.webp',
  '.woff',
  '.woff2',
]);

export function findComments(path, text) {
  const extension = extname(path);
  if (SCRIPT_KINDS.has(extension)) {
    return findScriptComments(path, text, SCRIPT_KINDS.get(extension));
  }
  if (extension === '.html') {
    return findMatches(text, /<!--[\s\S]*?-->/g);
  }
  if (extension === '.css' || extension === '.scss') {
    return findDelimitedComments(text, { lineComments: false });
  }
  if (JSON_FILES.has(extension) || JSON_FILES.has(basename(path))) {
    return findDelimitedComments(text, { lineComments: true });
  }
  if (HASH_FILES.has(basename(path)) || HASH_EXTENSIONS.has(extension)) {
    return findMatches(text, /^[ \t]*#.*$/gm);
  }
  return [];
}

export function projectFiles() {
  return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
    .split('\n')
    .filter((path) => path.length > 0 && !SKIPPED_EXTENSIONS.has(extname(path)))
    .filter((path) => existsSync(path));
}

function findScriptComments(path, text, scriptKind) {
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, false, scriptKind);
  const ranges = new Map();
  const collect = (commentRanges) => {
    for (const range of commentRanges ?? []) {
      ranges.set(range.pos, { start: range.pos, end: range.end });
    }
  };
  const visit = (node) => {
    collect(ts.getLeadingCommentRanges(text, node.getFullStart()));
    collect(ts.getTrailingCommentRanges(text, node.getEnd()));
    node.getChildren(source).forEach(visit);
  };
  visit(source);
  return [...ranges.values()].sort((a, b) => a.start - b.start);
}

function findMatches(text, pattern) {
  return [...text.matchAll(pattern)].map((match) => ({
    start: match.index,
    end: match.index + match[0].length,
  }));
}

function findDelimitedComments(text, { lineComments }) {
  const comments = [];
  let quote = null;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quote !== null) {
      if (char === '\\') {
        index++;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
    } else if (text.startsWith('/*', index)) {
      const close = text.indexOf('*/', index + 2);
      const end = close === -1 ? text.length : close + 2;
      comments.push({ start: index, end });
      index = end - 1;
    } else if (lineComments && text.startsWith('//', index)) {
      const newline = text.indexOf('\n', index);
      const end = newline === -1 ? text.length : newline;
      comments.push({ start: index, end });
      index = end - 1;
    }
  }
  return comments;
}

function lineOf(text, offset) {
  return text.slice(0, offset).split('\n').length;
}

function main() {
  const violations = projectFiles().flatMap((path) => {
    const text = readFileSync(path, 'utf8');
    return findComments(path, text).map(
      (comment) =>
        `${path}:${lineOf(text, comment.start)}  ${text.slice(comment.start, comment.end).split('\n')[0].trim()}`,
    );
  });
  if (violations.length === 0) {
    console.log('No comments found.');
    return;
  }
  console.error(
    `Comments are not allowed in this project (CLAUDE.md section 11):\n${violations.join('\n')}`,
  );
  process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
