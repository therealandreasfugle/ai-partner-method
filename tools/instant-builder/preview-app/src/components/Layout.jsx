import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';

export default function Layout({ children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="w-full">
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
