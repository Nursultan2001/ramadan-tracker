export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-6 md:py-8">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2026 Ramadan Challenge Tracker. All rights reserved.
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-xs md:text-sm text-muted-foreground mb-2">Sponsored by</p>
            <a
              href="https://ktlianwears.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm md:text-base font-semibold text-primary hover:text-primary/80 transition-colors duration-200 underline decoration-1 decoration-primary/50 hover:decoration-primary"
            >
              Ktlian Wears :)
            </a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs md:text-sm text-muted-foreground">
              Made with 🤍 for the Ramadan community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
