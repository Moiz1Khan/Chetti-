import { Link } from "react-router-dom";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Integrations", href: "/integrations" },
    { label: "Changelog", href: "/changelog" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/api-reference" },
    { label: "Blog", href: "/blog" },
    { label: "Community", href: "/community" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

const Footer = () => (
  <footer className="border-t border-border/30 py-16">
    <div className="container">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div>
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg text-foreground mb-4">
            <img src="/logo.png" alt="Chetti" className="h-8 w-8 rounded-lg" />
            Chetti
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Build, train, and deploy AI chatbots powered by your own data.
          </p>
        </div>
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm">{title}</h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/30 pt-8 text-center text-sm text-muted-foreground space-y-2">
        <p>© {new Date().getFullYear()} Chetti. All rights reserved.</p>
        <p>
          Powered by{" "}
          <a href="https://paisoltechnology.com" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
            Paisol Technology
          </a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
