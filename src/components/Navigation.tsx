import { useState, useEffect } from "react";
import { Menu, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Work", href: "#gallery" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled || isOpen ? "bg-white/5 backdrop-blur-xl border-b border-white/10 py-3" : "bg-transparent py-6"
      )}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <span className="text-lg font-heading font-light tracking-wide text-foreground">
            MOSTAFA<span className="font-bold">VISION</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-12">
          {navItems.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className="nav-link"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {item.label}
            </a>
          ))}

          {isAuthenticated ? (
            <a
              href="/admin"
              className="px-4 py-1.5 rounded-full bg-foreground text-background text-[10px] uppercase tracking-widest font-bold hover:bg-foreground/80 transition-all duration-300 flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Admin
            </a>
          ) : (
            <a
              href="/auth"
              className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
            >
              Log In
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-[100%] left-0 right-0 h-screen bg-background/90 backdrop-blur-2xl animate-in slide-in-from-top-5 duration-300">
          <div className="container py-20 flex flex-col gap-10 items-center justify-center h-3/4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-4xl font-light tracking-tight text-foreground hover:scale-110 transition-transform duration-300"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href={isAuthenticated ? "/admin" : "/auth"}
              className="mt-10 px-8 py-3 rounded-full border border-foreground/20 text-sm uppercase tracking-widest font-bold hover:bg-foreground hover:text-background transition-all"
              onClick={() => setIsOpen(false)}
            >
              {isAuthenticated ? "Dashboard" : "Admin Access"}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
