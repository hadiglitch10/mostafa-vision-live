const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-border">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {currentYear} Mostafavision. All rights reserved.</p>
        <p className="text-xs tracking-wider uppercase">
          Capturing the moment since 2020
        </p>
      </div>
    </footer>
  );
};

export default Footer;
