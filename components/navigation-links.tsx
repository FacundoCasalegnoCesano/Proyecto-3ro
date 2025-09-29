interface NavigationLink {
  href: string;
  label: string;
}

interface NavigationLinksProps {
  links: NavigationLink[];
  showViewMore?: boolean;
}

export function NavigationLinks({
  links,
  showViewMore = true,
}: NavigationLinksProps) {
  return (
    <section className="py-8 bg-white border-t border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="hover:text-babalu-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
          {showViewMore && <span className="text-babalu-primary">Ver más</span>}
        </div>
      </div>
    </section>
  );
}
