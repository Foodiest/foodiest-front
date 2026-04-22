import TopNavBar from './TopNavBar';
import Footer from './Footer';
import AIChatBot from './AIChatBot';

export default function Layout({ children, hideNav = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {!hideNav && <TopNavBar />}
      <main className="flex-1">
        {children}
      </main>
      {!hideNav && <Footer />}
      <AIChatBot />
    </div>
  );
}
