import { ChevronDown } from "lucide-react";

interface HeroProps {
  heroImage: string;
}

const Hero = ({ heroImage }: HeroProps) => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Concert photography by Mostafavision"
          className="w-full h-full object-cover"
        />
        <div 
          className="absolute inset-0" 
          style={{ background: 'var(--hero-overlay)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-32 container">
        <div className="max-w-4xl">
          <p className="hero-subtitle animate-fade-up mb-4">
            Concert & Street Photographer
          </p>
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black uppercase tracking-tighter leading-[0.85] animate-fade-up-delay">
            <span className="text-foreground">MOSTAFA</span>
            <br />
            <span className="text-primary">VISION</span>
          </h1>
          <p className="mt-6 md:mt-8 text-muted-foreground text-base md:text-lg max-w-md animate-fade-up-delay-2">
            Capturing raw energy, fleeting moments, and the pulse of live music.
          </p>
        </div>

        {/* Scroll Indicator */}
        <a 
          href="#gallery" 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-up-delay-2"
        >
          <span className="text-xs uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown size={20} className="animate-bounce" />
        </a>
      </div>
    </section>
  );
};

export default Hero;
