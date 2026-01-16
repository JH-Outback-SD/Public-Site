#!/usr/bin/env npx tsx

/**
 * Blog Build Script
 *
 * Converts markdown files from blog-content/ to TypeScript data files.
 * Also copies images to the public directory.
 *
 * Usage:
 *   pnpm blog:build             # Interactive mode - choose action
 *   pnpm blog:build --all       # Build all articles
 *   pnpm blog:build <slug>      # Build a specific article by slug
 *   pnpm blog:build --delete    # Interactive delete mode
 *   pnpm blog:build -d <slug>   # Delete a specific article by slug
 */

import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import { fileURLToPath } from 'url'

// ES module compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths
const BLOG_CONTENT_DIR = path.resolve(__dirname, '../../blog-content')
const BLOG_IMAGES_DIR = path.join(BLOG_CONTENT_DIR, 'images')
const OUTPUT_DATA_DIR = path.resolve(__dirname, '../src/data/blog')
const PUBLIC_BLOG_IMAGES_DIR = path.resolve(__dirname, '../public/images/blog')

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Parse frontmatter from markdown
interface Frontmatter {
  title: string
  slug: string
  excerpt: string
  featuredImage: string
  category: string
  publishDate: string
  author: string
  tags: string[]
  subtitle?: string
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    throw new Error('Invalid frontmatter format')
  }

  const [, frontmatterStr, body] = match
  const frontmatter: Record<string, unknown> = {}

  // Parse YAML-like frontmatter
  const lines = frontmatterStr.split('\n')
  let currentKey = ''
  let inArray = false
  let arrayItems: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine) continue

    // Check if this is an array item
    if (trimmedLine.startsWith('- ') && inArray) {
      arrayItems.push(trimmedLine.slice(2).trim())
      continue
    }

    // If we were in an array and this line is not an item, save the array
    if (inArray && !trimmedLine.startsWith('- ')) {
      frontmatter[currentKey] = arrayItems
      inArray = false
      arrayItems = []
    }

    // Parse key-value pairs
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim()

      if (value === '') {
        // This might be the start of an array
        currentKey = key
        inArray = true
        arrayItems = []
      } else {
        frontmatter[key] = value
      }
    }
  }

  // Handle any remaining array
  if (inArray) {
    frontmatter[currentKey] = arrayItems
  }

  // Ensure tags is an array
  if (!Array.isArray(frontmatter.tags)) {
    frontmatter.tags = []
  }

  return {
    frontmatter: frontmatter as unknown as Frontmatter,
    body: body.trim(),
  }
}

// Convert markdown to HTML (basic conversion)
function markdownToHtml(markdown: string): string {
  let html = markdown

  // Headers (process from h6 to h1 to avoid partial matches)
  html = html.replace(/^###### (.*$)/gm, '<h6 class="text-sm font-semibold text-primary mt-4 mb-2">$1</h6>')
  html = html.replace(/^##### (.*$)/gm, '<h5 class="text-base font-semibold text-primary mt-4 mb-2">$1</h5>')
  html = html.replace(/^#### (.*$)/gm, '<h4 class="text-lg font-bold text-primary mt-6 mb-3">$1</h4>')
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-primary mt-8 mb-4">$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-primary mt-10 mb-4">$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-primary mt-12 mb-6">$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="text-accent">$1</em>')

  // Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-accent pl-4 my-6 italic text-gray-600">$1</blockquote>')

  // Unordered lists
  html = html.replace(/^- (.*$)/gm, '<li class="flex items-start gap-2"><span class="text-accent">•</span><span>$1</span></li>')

  // Wrap consecutive list items in ul
  html = html.replace(
    /(<li class="flex items-start gap-2">.*?<\/li>\n?)+/gs,
    (match) => `<ul class="space-y-2 text-gray-600 my-4">${match}</ul>`
  )

  // Paragraphs - wrap non-tagged lines
  const lines = html.split('\n')
  const processedLines = lines.map((line) => {
    const trimmed = line.trim()
    if (
      !trimmed ||
      trimmed.startsWith('<') ||
      trimmed.startsWith('</') ||
      trimmed.includes('</li>') ||
      trimmed.includes('</ul>')
    ) {
      return line
    }
    return `<p class="text-gray-600 my-4">${trimmed}</p>`
  })

  html = processedLines.join('\n')

  // Clean up empty paragraphs
  html = html.replace(/<p class="text-gray-600 my-4"><\/p>/g, '')

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-accent hover:underline">$1</a>'
  )

  // Images in content
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="rounded-lg my-6 w-full" />'
  )

  return html
}

// Get all markdown files
function getMarkdownFiles(): string[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    log(`Blog content directory not found: ${BLOG_CONTENT_DIR}`, 'red')
    return []
  }

  return fs
    .readdirSync(BLOG_CONTENT_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => path.join(BLOG_CONTENT_DIR, file))
}

// Copy images
function copyImages(): void {
  if (!fs.existsSync(BLOG_IMAGES_DIR)) {
    log('No images directory found, skipping image copy', 'yellow')
    return
  }

  // Create output directory
  if (!fs.existsSync(PUBLIC_BLOG_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_BLOG_IMAGES_DIR, { recursive: true })
  }

  const images = fs.readdirSync(BLOG_IMAGES_DIR)
  for (const image of images) {
    const src = path.join(BLOG_IMAGES_DIR, image)
    const dest = path.join(PUBLIC_BLOG_IMAGES_DIR, image)

    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dest)
      log(`  Copied: ${image}`, 'cyan')
    }
  }
}

// Process a single markdown file
function processMarkdownFile(filePath: string): { slug: string; meta: Frontmatter; html: string } {
  const content = fs.readFileSync(filePath, 'utf-8')
  const { frontmatter, body } = parseFrontmatter(content)
  const html = markdownToHtml(body)

  // Update image paths
  let processedHtml = html
  if (frontmatter.featuredImage && frontmatter.featuredImage.startsWith('images/')) {
    frontmatter.featuredImage = `/images/blog/${frontmatter.featuredImage.replace('images/', '')}`
  }

  return {
    slug: frontmatter.slug,
    meta: frontmatter,
    html: processedHtml,
  }
}

// Generate TypeScript files
function generateTypeScriptFiles(
  articles: Array<{ slug: string; meta: Frontmatter; html: string }>
): void {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DATA_DIR)) {
    fs.mkdirSync(OUTPUT_DATA_DIR, { recursive: true })
  }

  // Generate individual article files
  for (const article of articles) {
    const articleContent = `// Auto-generated - DO NOT EDIT
// Generated by: pnpm blog:build
// Source: blog-content/${article.slug}.md

import type { BlogPost } from '../../types/blog'

export const ${camelCase(article.slug)}: BlogPost = {
  title: ${JSON.stringify(article.meta.title)},
  slug: ${JSON.stringify(article.meta.slug)},
  excerpt: ${JSON.stringify(article.meta.excerpt)},
  featuredImage: ${JSON.stringify(article.meta.featuredImage)},
  category: ${JSON.stringify(article.meta.category)},
  publishDate: ${JSON.stringify(article.meta.publishDate)},
  author: ${JSON.stringify(article.meta.author)},
  tags: ${JSON.stringify(article.meta.tags)},
  ${article.meta.subtitle ? `subtitle: ${JSON.stringify(article.meta.subtitle)},` : ''}
  content: \`${escapeTemplate(article.html)}\`,
}

export default ${camelCase(article.slug)}
`

    const outputPath = path.join(OUTPUT_DATA_DIR, `${article.slug}.ts`)
    fs.writeFileSync(outputPath, articleContent)
    log(`  Generated: ${article.slug}.ts`, 'green')
  }

  // Generate index file with all posts metadata
  const indexContent = `// Auto-generated - DO NOT EDIT
// Generated by: pnpm blog:build

import type { BlogPostMeta, BlogPost } from '../../types/blog'

${articles.map((a) => `import { ${camelCase(a.slug)} } from './${a.slug}'`).join('\n')}

// All blog posts with full content
export const blogPosts: Record<string, BlogPost> = {
${articles.map((a) => `  '${a.slug}': ${camelCase(a.slug)},`).join('\n')}
}

// Blog posts metadata only (for listing pages)
export const blogPostsMeta: BlogPostMeta[] = [
${articles
  .map(
    (a) => `  {
    title: ${JSON.stringify(a.meta.title)},
    slug: ${JSON.stringify(a.meta.slug)},
    excerpt: ${JSON.stringify(a.meta.excerpt)},
    featuredImage: ${JSON.stringify(a.meta.featuredImage)},
    category: ${JSON.stringify(a.meta.category)},
    publishDate: ${JSON.stringify(a.meta.publishDate)},
    author: ${JSON.stringify(a.meta.author)},
    tags: ${JSON.stringify(a.meta.tags)},
    ${a.meta.subtitle ? `subtitle: ${JSON.stringify(a.meta.subtitle)},` : ''}
  },`
  )
  .join('\n')}
]

// Get a single blog post by slug
export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts[slug]
}

// Get all categories
export function getAllCategories(): string[] {
  const categories = new Set(blogPostsMeta.map((post) => post.category))
  return Array.from(categories).sort()
}

// Get all tags
export function getAllTags(): string[] {
  const tags = new Set(blogPostsMeta.flatMap((post) => post.tags))
  return Array.from(tags).sort()
}

export default blogPosts
`

  fs.writeFileSync(path.join(OUTPUT_DATA_DIR, 'index.ts'), indexContent)
  log('  Generated: index.ts', 'green')
}

// Helper functions
function camelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

function escapeTemplate(str: string): string {
  return str.replace(/`/g, '\\`').replace(/\$/g, '\\$')
}

// Interactive prompt
async function promptUser(): Promise<'all' | string> {
  const files = getMarkdownFiles()

  if (files.length === 0) {
    log('No markdown files found in blog-content/', 'red')
    process.exit(1)
  }

  const slugs = files.map((f) => path.basename(f, '.md'))

  console.log('')
  log('╔══════════════════════════════════════════╗', 'blue')
  log('║       JHO Blog Build Script              ║', 'blue')
  log('╚══════════════════════════════════════════╝', 'blue')
  console.log('')
  log('Available articles:', 'bright')
  slugs.forEach((slug, i) => log(`  ${i + 1}. ${slug}`, 'cyan'))
  console.log('')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(
      `${colors.yellow}Build [A]ll articles or enter article number/slug: ${colors.reset}`,
      (answer) => {
        rl.close()

        const trimmed = answer.trim().toLowerCase()

        if (trimmed === 'a' || trimmed === 'all' || trimmed === '') {
          resolve('all')
        } else if (/^\d+$/.test(trimmed)) {
          const index = parseInt(trimmed, 10) - 1
          if (index >= 0 && index < slugs.length) {
            resolve(slugs[index])
          } else {
            log(`Invalid number. Please enter 1-${slugs.length}`, 'red')
            process.exit(1)
          }
        } else if (slugs.includes(trimmed)) {
          resolve(trimmed)
        } else {
          log(`Article not found: ${trimmed}`, 'red')
          process.exit(1)
        }
      }
    )
  })
}

// Main build function
async function build(target: 'all' | string): Promise<void> {
  console.log('')
  log('Starting blog build...', 'bright')
  console.log('')

  const files = getMarkdownFiles()

  if (files.length === 0) {
    log('No markdown files found!', 'red')
    return
  }

  // Filter files if specific target
  const filesToProcess =
    target === 'all' ? files : files.filter((f) => path.basename(f, '.md') === target)

  if (filesToProcess.length === 0) {
    log(`Article not found: ${target}`, 'red')
    return
  }

  log('Processing markdown files...', 'yellow')
  const articles = filesToProcess.map((file) => {
    log(`  Reading: ${path.basename(file)}`, 'cyan')
    return processMarkdownFile(file)
  })

  console.log('')
  log('Copying images...', 'yellow')
  copyImages()

  console.log('')
  log('Generating TypeScript files...', 'yellow')

  // If building a single article, we need to merge with existing data
  if (target !== 'all') {
    const indexPath = path.join(OUTPUT_DATA_DIR, 'index.ts')
    if (fs.existsSync(indexPath)) {
      // Read all existing markdown files to regenerate index
      const allArticles = files.map((file) => processMarkdownFile(file))
      generateTypeScriptFiles(allArticles)
    } else {
      generateTypeScriptFiles(articles)
    }
  } else {
    generateTypeScriptFiles(articles)
  }

  console.log('')
  log('╔══════════════════════════════════════════╗', 'green')
  log('║       Build completed successfully!      ║', 'green')
  log('╚══════════════════════════════════════════╝', 'green')
  console.log('')
}

// Get all generated TypeScript article files
function getGeneratedArticles(): string[] {
  if (!fs.existsSync(OUTPUT_DATA_DIR)) {
    return []
  }

  return fs
    .readdirSync(OUTPUT_DATA_DIR)
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
    .map((file) => file.replace('.ts', ''))
}

// Delete an article
async function deleteArticle(slug: string): Promise<void> {
  const articlePath = path.join(OUTPUT_DATA_DIR, `${slug}.ts`)

  if (!fs.existsSync(articlePath)) {
    log(`Article not found: ${slug}`, 'red')
    return
  }

  // Delete the article file
  fs.unlinkSync(articlePath)
  log(`  Deleted: ${slug}.ts`, 'red')

  // Regenerate index from remaining markdown files
  const files = getMarkdownFiles()

  if (files.length === 0) {
    // No markdown files left, create empty index
    const emptyIndex = `// Auto-generated - DO NOT EDIT
// Generated by: pnpm blog:build

import type { BlogPostMeta, BlogPost } from '../../types/blog'

// All blog posts with full content
export const blogPosts: Record<string, BlogPost> = {}

// Blog posts metadata only (for listing pages)
export const blogPostsMeta: BlogPostMeta[] = []

// Get a single blog post by slug
export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts[slug]
}

// Get all categories
export function getAllCategories(): string[] {
  return []
}

// Get all tags
export function getAllTags(): string[] {
  return []
}

export default blogPosts
`
    fs.writeFileSync(path.join(OUTPUT_DATA_DIR, 'index.ts'), emptyIndex)
    log('  Regenerated: index.ts (empty)', 'green')
  } else {
    // Regenerate with remaining articles
    const articles = files.map((file) => processMarkdownFile(file))
    generateTypeScriptFiles(articles)
  }

  console.log('')
  log('╔══════════════════════════════════════════╗', 'green')
  log('║       Article deleted successfully!      ║', 'green')
  log('╚══════════════════════════════════════════╝', 'green')
  console.log('')
}

// Interactive delete prompt
async function promptDelete(): Promise<string | null> {
  const articles = getGeneratedArticles()

  if (articles.length === 0) {
    log('No articles to delete.', 'yellow')
    return null
  }

  console.log('')
  log('╔══════════════════════════════════════════╗', 'red')
  log('║       Delete Blog Article                ║', 'red')
  log('╚══════════════════════════════════════════╝', 'red')
  console.log('')
  log('Generated articles:', 'bright')
  articles.forEach((slug, i) => log(`  ${i + 1}. ${slug}`, 'cyan'))
  console.log('')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(
      `${colors.yellow}Enter article number/slug to delete (or 'c' to cancel): ${colors.reset}`,
      (answer) => {
        rl.close()

        const trimmed = answer.trim().toLowerCase()

        if (trimmed === 'c' || trimmed === 'cancel' || trimmed === '') {
          log('Delete cancelled.', 'yellow')
          resolve(null)
        } else if (/^\d+$/.test(trimmed)) {
          const index = parseInt(trimmed, 10) - 1
          if (index >= 0 && index < articles.length) {
            resolve(articles[index])
          } else {
            log(`Invalid number. Please enter 1-${articles.length}`, 'red')
            resolve(null)
          }
        } else if (articles.includes(trimmed)) {
          resolve(trimmed)
        } else {
          log(`Article not found: ${trimmed}`, 'red')
          resolve(null)
        }
      }
    )
  })
}

// Interactive mode - choose action
async function promptAction(): Promise<'build' | 'delete'> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  console.log('')
  log('╔══════════════════════════════════════════╗', 'blue')
  log('║       JHO Blog Build Script              ║', 'blue')
  log('╚══════════════════════════════════════════╝', 'blue')
  console.log('')
  log('What would you like to do?', 'bright')
  log('  [B] Build articles (default)', 'cyan')
  log('  [D] Delete an article', 'cyan')
  console.log('')

  return new Promise((resolve) => {
    rl.question(
      `${colors.yellow}Choose action [B/d]: ${colors.reset}`,
      (answer) => {
        rl.close()
        const trimmed = answer.trim().toLowerCase()
        if (trimmed === 'd' || trimmed === 'delete') {
          resolve('delete')
        } else {
          resolve('build')
        }
      }
    )
  })
}

// CLI entry point
async function main(): Promise<void> {
  const args = process.argv.slice(2)

  // Handle delete flags
  if (args.includes('--delete')) {
    const slug = await promptDelete()
    if (slug) {
      await deleteArticle(slug)
    }
    return
  }

  if (args.includes('-d') || args.includes('--delete-slug')) {
    const flagIndex = args.findIndex((a) => a === '-d' || a === '--delete-slug')
    const slug = args[flagIndex + 1]
    if (!slug || slug.startsWith('-')) {
      log('Please provide an article slug to delete', 'red')
      process.exit(1)
    }
    await deleteArticle(slug)
    return
  }

  // Handle build flags
  if (args.includes('--all') || args.includes('-a')) {
    await build('all')
  } else if (args.length > 0 && !args[0].startsWith('-')) {
    await build(args[0])
  } else {
    // Interactive mode - first choose action
    const action = await promptAction()
    if (action === 'delete') {
      const slug = await promptDelete()
      if (slug) {
        await deleteArticle(slug)
      }
    } else {
      const target = await promptUser()
      await build(target)
    }
  }
}

main().catch((error) => {
  log(`Error: ${error.message}`, 'red')
  process.exit(1)
})
