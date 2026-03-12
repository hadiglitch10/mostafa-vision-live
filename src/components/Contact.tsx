import { Instagram, ArrowUpRight } from "lucide-react";
import { ContentMap } from "@/hooks/usePageContent";

interface ContactProps {
  content?: ContentMap;
}

const Contact = ({ content = {} }: ContactProps) => {
  return (
    <section id="contact" className="py-16 md:py-40 container relative overflow-hidden">
      {/* Background Blobs (Light Purple/Red) - Hidden on mobile for performance */}
      <div className="hidden md:block absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-purple-600/5 rounded-full filter blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="hidden md:block absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-600/5 rounded-full filter blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center space-y-12">

        {/* Header */}
        <div className="space-y-6 px-4">
          <div className="inline-block px-4 py-1 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
            <span className="font-typewriter text-xs tracking-widest uppercase text-primary">
              {content.contact_badge ?? "Get In Touch"}
            </span>
          </div>

          <h2 className="text-5xl md:text-8xl font-typewriter font-bold tracking-tighter text-foreground leading-tight">
            {content.contact_title_line1 ?? "LET'S CREATE"} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50 italic">
              {content.contact_title_line2 ?? "SOMETHING RAW."}
            </span>
          </h2>

          <p className="text-muted-foreground font-typewriter text-base md:text-lg max-w-xl mx-auto leading-relaxed px-2">
            {content.contact_description ?? "Available for concert coverage, editorial shoots, and creative collaborations. Drop a line—let's make it happen."}
          </p>
        </div>

        {/* Action Buttons - Mobile Stacked */}
        <div className="flex flex-col gap-4 w-full px-6 md:px-0 md:flex-row md:justify-center md:items-center">

          <a
            href={content.contact_instagram_url ?? "https://www.instagram.com/mustafavision?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full md:w-auto relative px-8 py-5 border-2 border-foreground text-foreground font-typewriter text-sm md:text-base font-bold tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300 rounded-sm active:scale-95"
          >
            <div className="flex items-center justify-center gap-3">
              <Instagram size={18} />
              <span>Instagram</span>
              <ArrowUpRight size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        </div>

        {/* Footer Credit */}
        <div className="pt-20 space-y-3 opacity-30 hover:opacity-100 transition-opacity duration-500">
          <p className="font-typewriter text-xs tracking-[0.5em] uppercase">
            Mustafa Vision © {new Date().getFullYear()}
          </p>
          <p className="font-typewriter text-[10px] tracking-wider opacity-60">
            Website by{" "}
            <a
              href="https://www.instagram.com/hadiglitch/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors"
            >
              @hadiglitch
            </a>
          </p>
        </div>

      </div>
    </section>
  );
};

export default Contact;
