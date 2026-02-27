import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Camera, ExternalLink, FolderOpen, Video, Image } from 'lucide-react';
import PhotoUpload from '@/components/admin/PhotoUpload';
import PhotoGrid from '@/components/admin/PhotoGrid';
import CategoryManager from '@/components/admin/CategoryManager';
import VideoUpload from '@/components/admin/VideoUpload';
import { cn } from '@/lib/utils';

type Tab = 'photos' | 'categories' | 'videos';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'photos', label: 'Photos', icon: Image },
  { key: 'categories', label: 'Categories', icon: FolderOpen },
  { key: 'videos', label: 'Videos', icon: Video },
];

const Admin = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('photos');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <a href="/" className="text-lg font-bold tracking-tight">
              MOSTAFA<span className="text-primary">VISION</span>
            </a>
            <span className="text-xs uppercase tracking-widest text-muted-foreground hidden sm:inline">
              / Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors hidden sm:flex items-center gap-1 text-sm"
            >
              View Site <ExternalLink size={14} />
            </a>

            <div className="hidden sm:block h-4 w-px bg-border" />

            <span className="text-sm text-muted-foreground hidden md:inline">
              {user?.email}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Camera className="text-primary" />
              Digital Archive
            </h1>
            <p className="text-muted-foreground mt-1">
              Upload, organize, and manage your photography portfolio
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-muted/40 rounded-xl border border-border/50 w-full sm:w-fit">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                activeTab === key
                  ? 'bg-card shadow-sm text-foreground border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <Icon size={15} />
              <span className="hidden xs:inline sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'photos' && (
          <div className="space-y-8">
            <PhotoUpload />
            <PhotoGrid />
          </div>
        )}

        {activeTab === 'categories' && (
          <CategoryManager />
        )}

        {activeTab === 'videos' && (
          <VideoUpload />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Mustafavision Admin Portal • Images auto-compressed to WebP (max 2000px)</p>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
