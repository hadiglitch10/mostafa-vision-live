import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { usePhotos, useFeaturedPhoto } from "@/hooks/usePhotos";
import heroImage from "@/assets/hero-concert.jpg";

const Index = () => {
  const { data: photos = [], isLoading } = usePhotos();
  const { data: featuredPhoto } = useFeaturedPhoto();

  // Use featured photo as hero, or first photo, or default generated image
  const currentHero = featuredPhoto?.image_url || photos[0]?.image_url || heroImage;

  return (
    <main className="min-h-screen bg-background">
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
