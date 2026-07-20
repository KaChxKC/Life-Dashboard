import { Linkedin, Github, Mail } from 'lucide-react';

const links = [
  {
    href: 'https://linkedin.com/in/KaChKC',
    label: 'LinkedIn',
    icon: Linkedin,
  },
  { href: 'https://github.com/KaChxKC', label: 'GitHub', icon: Github },
  { href: 'mailto:kartikeychauhan321@gmail.com', label: 'Email', icon: Mail },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink-800 px-5 py-5 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-fg-500">
          Built by <span className="text-fg-300">Kartikey Chauhan</span>
        </p>
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              aria-label={label}
              className="rounded-md p-2 text-fg-500 transition-colors hover:bg-ink-800 hover:text-fg-200"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
