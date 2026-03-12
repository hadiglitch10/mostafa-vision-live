import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ContentMap } from "@/hooks/usePageContent";

interface HeroProps {
  heroImage: string;
  heroVideo?: string;
  content?: ContentMap;
}

const Hero = ({ heroImage, heroVideo, content = {} }: HeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Detect mobile once on mount — no state, no re-renders
  const isMobile = useRef(typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    // Parallax disabled on mobile — too expensive
    if (isMobile.current) return;

    const handleScroll = () => {
      if (!parallaxRef.current || !heroRef.current) return;
      if (heroRef.current.getBoundingClientRect().bottom <= 0) return;
      // Direct DOM mutation — no React re-render on every scroll frame
      parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.4}px) scale(1.05)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't autoplay video on mobile — saves bandwidth and battery
  const showVideo = heroVideo && !isMobile.current;

  return (
    <section ref={heroRef} className="relative h-screen w-full overflow-hidden bg-background">
      {/* Background Media with Parallax & Blur */}
      <div
        ref={parallaxRef}
        className="absolute inset-0"
        style={{ transform: "translateY(0px) scale(1.05)" }}
      >
        <div className="absolute inset-0 bg-black/40 z-10" />

        {showVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-[2000ms] ${isLoaded ? "opacity-100" : "opacity-0"} grayscale contrast-125`}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        ) : (
          <img
            src={heroImage}
            alt="Photography by Mustafavision"
            fetchPriority="high"
            className={`w-full h-full object-cover transition-opacity duration-[2000ms] ease-out ${isLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setIsLoaded(true)}
          />
        )}
      </div>

      {/* Glass Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)" }}
      />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center items-center text-center pb-20 container">
        <div className="space-y-8 max-w-5xl mx-auto">
          <p className="text-sm md:text-base uppercase tracking-[0.4em] font-light text-white/80 animate-fade-up">
            {content.hero_subtitle ?? "Mustafa Vision"}
          </p>

          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-thin tracking-tighter leading-[0.9] text-white mix-blend-overlay animate-fade-up-delay">
            {content.hero_title_line1 ?? "Light"}{" "}
            <span className="font-normal italic font-serif opacity-90">&</span> <br />
            {content.hero_title_line2 ?? "Motion"}
          </h1>

          <p className="text-white/70 font-light text-lg md:text-xl max-w-xl mx-auto leading-relaxed animate-fade-up-delay-2">
            {content.hero_description ?? "Capturing the raw frequency of live performance and the silent narrative of the streets."}
          </p>

          {/* Admin Quick Action */}
          {isAuthenticated && (
            <div className="pt-8 animate-fade-up-delay-2">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="glass-button flex items-center gap-3 mx-auto group"
              >
                <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/40 transition-colors">
                  <Plus size={16} />
                </div>
                <span className="text-sm font-medium tracking-wide">Add New Photo</span>
              </button>
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <a
          href="#gallery"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/50 hover:text-white transition-colors duration-500 animate-fade-up-delay-2 group"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] group-hover:tracking-[0.8em] transition-all">Explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0 group-hover:h-16 transition-all" />
        </a>
      </div>
    </section>
  );
};

export default Hero;
