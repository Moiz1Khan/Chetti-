import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSectionNav = (hash: string) => {
    if (location.pathname !== "/") {
      navigate(`/${hash}`);
      setMobileOpen(false);
      return;
    }

    const sectionId = hash.replace("#", "");
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  const handleBrandClick = () => {
    if (location.pathname === "/") {
      window.location.reload();
      return;
    }
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-strong shadow-lg shadow-background/50" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <button
          type="button"
          onClick={handleBrandClick}
          className="flex items-center gap-2.5 font-display font-bold text-xl text-foreground"
          aria-label="Refresh Chetti home"
        >
          <img src="/logo.png" alt="Chetti" className="h-8 w-8 rounded-lg" />
          Chetti
        </button>

        {/* Desktop nav - pill style like ReactBits */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/60 bg-secondary/50 backdrop-blur-xl px-2 py-1.5">
          {navLinks.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => handleSectionNav(link.href)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-1.5 rounded-full hover:bg-secondary transition-all duration-200"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" variant="hero" asChild>
            <Link to="/signup" className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Get Started Free
            </Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-border/50 overflow-hidden"
          >
            <nav className="container flex flex-col gap-3 py-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleSectionNav(link.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground py-1.5"
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                <Button variant="ghost" size="sm" asChild><Link to="/login">Log in</Link></Button>
                <Button size="sm" variant="hero" asChild><Link to="/signup">Get Started Free</Link></Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
