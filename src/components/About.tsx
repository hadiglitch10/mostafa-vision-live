import { Instagram, Mail } from "lucide-react";
import aboutImage from "@/assets/about.jpeg";

const About = () => {
  return (
    <section id="about" className="py-20 md:py-40 bg-background relative overflow-hidden">
      {/* Background Blobs (Light Purple/Red) */}
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-red-500/5 rounded-full filter blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-rose-500/5 rounded-full filter blur-[80px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen" />

      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">

          {/* Text Content */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
              <span className="font-typewriter text-xs tracking-widest uppercase text-primary">The Artist</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-typewriter font-bold leading-tight text-foreground mix-blend-difference">
              THE EYE BEHIND <br />
              <span className="text-primary italic">THE LENS.</span>
            </h2>

            <div className="space-y-6 text-muted-foreground font-typewriter text-sm md:text-base leading-relaxed">
              <p>
                23-year-old concert and street photographer based in the heart of the music scene.
                I live for the chaos of a mosh pit, the quiet intensity of a backstage moment,
                and everything in between.
              </p>
              <p>
                My work is about capturing energy you can feel—the sweat, the lights,
                the raw emotion that makes live music unforgettable.
              </p>
            </div>
          </div>

          {/* Visual / Image */}
          <div className="relative group">
            {/* Glass Card Container */}
            <div className="glass-panel p-2 rounded-sm rotate-3 group-hover:rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
              <div className="aspect-[4/5] bg-muted relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                {/* Actual Artist Portrait */}
                <img
                  src={aboutImage}
                  alt="Mostafa Vision"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Noise Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
              </div>
            </div>

            {/* Decorative Offset Image (optional second card) */}
            <div className="absolute inset-0 border-2 border-foreground/10 rounded-sm -z-10 rotate-[-5deg] scale-95 group-hover:rotate-[-2deg] transition-transform duration-700" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
