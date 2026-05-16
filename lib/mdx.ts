import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const projectsDir = path.join(process.cwd(), 'content/projects');

export async function getProjectSlugs(): Promise<string[]> {
  const files = await fs.readdir(projectsDir);
  return files.filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, ''));
}

export async function readProjectMdx(slug: string) {
  const raw = await fs.readFile(path.join(projectsDir, `${slug}.mdx`), 'utf8');
  const { data, content } = matter(raw);
  return { frontmatter: data as Record<string, unknown>, content };
}
