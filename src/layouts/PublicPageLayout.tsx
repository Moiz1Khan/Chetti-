import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const PublicPageLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="pt-24 pb-16">{children}</main>
    <Footer />
  </div>
);

export default PublicPageLayout;
