import { Instagram, Mail } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-card">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <h2 className="section-title">About</h2>
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
              The eye behind
              <br />
              <span className="text-primary">the lens.</span>
            </p>
            <div className="space-y-4 text-muted-foreground">
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

          <div className="relative">
            <div className="aspect-[4/5] bg-secondary rounded-sm overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-6xl font-black text-muted/50">M</span>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-primary/30 rounded-sm" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
