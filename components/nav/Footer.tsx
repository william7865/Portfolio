export function Footer({ arcadeToggle }: { arcadeToggle?: React.ReactNode }) {
  return (
    <footer className="border-t border-ink/10 mt-24 px-6 py-10 font-mono text-xs">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between gap-6">
        <div className="text-muted">
          © {new Date().getFullYear()} William Lin · Built with Next.js · Deployed on Vercel
        </div>
        <div className="flex gap-4 items-center">
          <a
            href="https://github.com/william7865"
            target="_blank"
            rel="noopener"
            className="hover:text-court-line"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/william-lin-623165295/"
            target="_blank"
            rel="noopener"
            className="hover:text-court-line"
          >
            LinkedIn
          </a>
          <a href="mailto:linwilliam14@gmail.com" className="hover:text-court-line">
            Email
          </a>
          {arcadeToggle}
        </div>
      </div>
    </footer>
  );
}
