import type { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { usePhotos, type Photo } from "@/hooks/usePhotos";
import { useVideos, type Video } from "@/hooks/useVideos";
import { usePageContent, type ContentMap } from "@/hooks/usePageContent";
import { usePageSections } from "@/hooks/usePageSections";
import heroImage from "@/assets/hero.jpeg";
import heroVideo from "@/assets/background.mp4";

type SectionRenderer = (content: ContentMap, extra: { photos: Photo[]; videos: Video[] }) => ReactNode;

const SECTION_COMPONENTS: Record<string, SectionRenderer> = {
  gallery: (_content, { photos, videos }) => (
    <Gallery key="gallery" photos={photos} videos={videos} />
  ),
  about: (content) => <About key="about" content={content} />,
  contact: (content) => <Contact key="contact" content={content} />,
};

const Index = () => {
  const { data: photos = [] } = usePhotos();
  const { data: videos = [] } = useVideos();
  const { data: content = {} } = usePageContent();
  const { data: sections = [] } = usePageSections();

  // Default order if sections table is empty
  const orderedSections = sections.length > 0
    ? sections.filter((s) => s.visible)
    : [{ section_key: "gallery" }, { section_key: "about" }, { section_key: "contact" }];

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Ambient Background (The "Aurora") */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-background hidden md:block">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-pink-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <Navigation />
      <Hero heroImage={heroImage} heroVideo={heroVideo} content={content} />

      {orderedSections.map((s) => {
        const render = SECTION_COMPONENTS[s.section_key];
        return render ? render(content, { photos, videos }) : null;
      })}

      <Footer />
    </main>
  );
};

export default Index;
