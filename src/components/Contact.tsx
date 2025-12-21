import { Instagram, ArrowUpRight } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 md:py-40 container relative overflow-hidden">
      {/* Background Blobs (Light Purple/Red) */}
      <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-purple-600/5 rounded-full filter blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-600/5 rounded-full filter blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center space-y-12">

        {/* Header */}
        <div className="space-y-6 px-4">
          <div className="inline-block px-4 py-1 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
            <span className="font-typewriter text-xs tracking-widest uppercase text-primary">Get In Touch</span>
          </div>

          <h2 className="text-4xl md:text-8xl font-typewriter font-bold tracking-tighter text-foreground leading-tight">
            LET'S CREATE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50 italic">SOMETHING RAW.</span>
          </h2>

          <p className="text-muted-foreground font-typewriter text-xs md:text-lg max-w-xl mx-auto leading-relaxed px-2">
            Available for concert coverage, editorial shoots, and creative collaborations.
            Drop a line—let's make it happen.
          </p>
        </div>

        {/* Action Buttons - Mobile Stacked */}
        <div className="flex flex-col gap-4 w-full px-6 md:px-0 md:flex-row md:justify-center md:items-center">

          <a
            href="https://www.instagram.com/mustafavision?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full md:w-auto relative px-8 py-4 border border-foreground text-foreground font-typewriter text-xs md:text-sm font-bold tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300 rounded-sm"
          >
            <div className="flex items-center justify-center gap-3">
              <Instagram size={18} />
              <span>Instagram</span>
              <ArrowUpRight size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        </div>

        {/* Footer Credit */}
        <div className="pt-20 opacity-30 hover:opacity-100 transition-opacity duration-500">
          <p className="font-typewriter text-xs tracking-[0.5em] uppercase">
            Mostafa Vision © {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </section>
  );
};

export default Contact;
