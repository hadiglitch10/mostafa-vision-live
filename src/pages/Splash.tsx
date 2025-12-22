import { useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";
import backgroundVideo from "@/assets/background.mp4";
const Splash = () => {
    const navigate = useNavigate();

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black flex flex-col items-center justify-center text-white">

            {/* 
        VIDEO BACKGROUND INSTRUCTIONS:
        1. Add your video file (e.g., 'background.mp4') to `src/assets/`.
        2. Import it at the top:
           import backgroundVideo from "@/assets/background.mp4";
        3. Uncomment the <video> block below and comment out the "CSS Red Blur" block.
      */}


            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-40 z-0 grayscale contrast-125"
            >
                <source src={backgroundVideo} type="video/mp4" />
            </video>

            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 text-center space-y-8 p-6 w-full max-w-[90vw]">

                {/* Title Stack - TYPEWRITER STYLE (Peter McKinnon inspired) */}
                <div className="space-y-3 animate-fade-up">
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-typewriter font-bold tracking-[0.1em] uppercase text-white mix-blend-difference leading-tight">
                        Mustafa <br /> Vision
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base font-typewriter tracking-[0.2em] md:tracking-[0.3em] uppercase text-white/80">
                        Photographer & Director
                    </p>
                </div>

                {/* Enter Button - Mobile Touch Friendly */}
                <button
                    onClick={() => navigate('/portfolio')}
                    className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 w-full sm:w-auto overflow-hidden rounded-sm bg-white text-black hover:bg-white/90 transition-all duration-500 animate-fade-up-delay active:scale-95 shadow-2xl"
                >
                    <span className="font-typewriter uppercase tracking-widest text-sm font-bold">Enter View</span>
                    <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

            </div>

            {/* Footer Socials */}
            <div className="absolute bottom-10 left-0 w-full flex justify-center gap-8 text-white/40 z-10">
                <a
                    href="https://www.instagram.com/mustafavision?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-typewriter uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                >
                    Instagram
                </a>
            </div>

        </div>
    );
};

export default Splash;
