export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto max-w-screen-2xl px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BHW PAS. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <a href="/terms" className="hover:text-foreground">
              Terms
            </a>
            <a href="/privacy" className="hover:text-foreground">
              Privacy
            </a>
            <a href="/contact" className="hover:text-foreground">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
