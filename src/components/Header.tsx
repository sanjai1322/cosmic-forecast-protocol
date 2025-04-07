
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StatusIndicator from './StatusIndicator';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const NavItems = () => (
    <>
      <Link to="/alerts">
        <Button 
          variant={location.pathname === '/alerts' ? "default" : "outline"} 
          size={isMobile ? "sm" : "sm"}
          className="ml-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          {!isMobile && 'Alerts'}
        </Button>
      </Link>
      <Link to="/dashboard">
        <Button 
          variant={location.pathname === '/dashboard' ? "default" : "ghost"} 
          size="sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M3 5v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            <path d="M3 10h18M10 3v18" />
          </svg>
          {!isMobile && 'Dashboard'}
        </Button>
      </Link>
      <Link to="/reports">
        <Button 
          variant={location.pathname === '/reports' ? "default" : "ghost"} 
          size="sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
          </svg>
          {!isMobile && 'Reports'}
        </Button>
      </Link>
    </>
  );

  return (
    <header className="py-2 px-3 md:py-3 md:px-4 border-b border-border/40">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-solar animate-solar-pulse flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-background">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2" />
                  <path d="M12 21v2" />
                  <path d="M4.22 4.22l1.42 1.42" />
                  <path d="M18.36 18.36l1.42 1.42" />
                  <path d="M1 12h2" />
                  <path d="M21 12h2" />
                  <path d="M4.22 19.78l1.42-1.42" />
                  <path d="M18.36 5.64l1.42-1.42" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-base md:text-lg font-bold leading-none animate-cosmic-glow">
                  COSMIC FORECAST
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">
                  Space Weather Prediction System
                </p>
              </div>
            </Link>
          </div>
          
          {isMobile ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-card/50 px-2 py-1 rounded-full border border-border/40">
                <StatusIndicator level="moderate" className="mr-1" />
                <span className="text-xs font-medium">SYSTEM NORMAL</span>
              </div>
              
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[200px] sm:w-[280px]">
                  <div className="flex flex-col space-y-4 pt-6">
                    <NavItems />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-card/50 px-3 py-1.5 rounded-full border border-border/40">
                <StatusIndicator level="moderate" className="mr-2" />
                <span className="text-sm font-medium">SYSTEM STATUS: NORMAL</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <NavItems />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
