import { Instagram, Mail, ArrowUpRight } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 md:py-32 container">
      <div className="max-w-2xl">
        <h2 className="section-title">Get In Touch</h2>
        <p className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-8">
          Let's create
          <br />
          <span className="text-primary">something raw.</span>
        </p>
        <p className="text-muted-foreground mb-10 max-w-md">
          Available for concert coverage, editorial shoots, and creative collaborations. 
          Drop a line—let's make it happen.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:hello@mostafavision.com"
            className="group flex items-center gap-3 px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-accent transition-colors"
          >
            <Mail size={20} />
            <span>Email Me</span>
            <ArrowUpRight size={18} className="ml-auto group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
          <a
            href="https://instagram.com/mostafavision"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-6 py-4 border border-border text-foreground font-semibold rounded-sm hover:bg-secondary transition-colors"
          >
            <Instagram size={20} />
            <span>Instagram</span>
            <ArrowUpRight size={18} className="ml-auto group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
