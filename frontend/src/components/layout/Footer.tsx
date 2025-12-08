import { Github, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col gap-4 px-4 py-6 md:flex-row md:justify-between md:py-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">MemoryLayer</p>
          <p className="text-xs text-muted-foreground">
            Your personal knowledge capture and search system
          </p>
        </div>

        <div className="flex flex-col gap-4 text-sm md:items-end">
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 MemoryLayer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
