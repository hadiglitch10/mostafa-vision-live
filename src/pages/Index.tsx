import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { usePhotos, useFeaturedPhoto } from "@/hooks/usePhotos";
import heroImage from "@/assets/hero.jpeg";

const Index = () => {
  const { data: photos = [], isLoading } = usePhotos();
  const { data: featuredPhoto } = useFeaturedPhoto();

  // Force static hero image as per user request
  const currentHero = heroImage;

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Ambient Background (The "Aurora") */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-pink-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <Navigation />
      <Hero heroImage={currentHero} />
      <Gallery photos={photos} />
      <About />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
