import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    user,
    signOut
  } = useAuth();
  const {
    subscribed,
    subscriptionTier,
    isTrialActive
  } = useSubscription();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };
  const navigation = [{
    name: 'Home',
    href: '/'
  }, {
    name: 'Resources',
    href: '/resources'
  }, {
    name: 'About',
    href: '/about'
  }];
  return <header className="sticky top-0 z-50 w-full border-b border-matrix-green/20 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/lovable-uploads/116d8223-82d2-48be-a0fa-567653c8f956.png" alt="GenerativeSearch.pro" className="h-10 w-auto filter drop-shadow-[0_0_10px_rgba(0,255,65,0.8)] object-contain" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map(item => (
            <Link key={item.name} to={item.href} className="text-matrix-green hover:text-matrix-lime transition-colors">
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {user ? <div className="flex items-center space-x-4">
              {/* Subscription Status Indicator */}
              {(subscribed || isTrialActive) && <div className="hidden sm:flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${subscribed ? 'bg-matrix-green' : 'bg-matrix-lime'}`}></div>
                  <span className="text-sm text-matrix-green">
                    {subscribed ? subscriptionTier : 'Trial'}
                  </span>
                </div>}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-matrix-green hover:text-matrix-lime hover:bg-matrix-green/10">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-matrix-dark-gray border-matrix-green/30" align="end">
                  <DropdownMenuLabel className="text-matrix-green">
                    {user.user_metadata?.full_name || user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-matrix-green/30" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-matrix-green hover:bg-matrix-green/10 focus:bg-matrix-green/10">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="text-matrix-green hover:bg-matrix-green/10 focus:bg-matrix-green/10">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-matrix-green/30" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-matrix-green hover:bg-matrix-green/10 focus:bg-matrix-green/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> : <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/auth')} className="text-matrix-green hover:text-matrix-lime hover:bg-matrix-green/10">
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth', {
            state: {
              signUp: true
            }
          })} className="glow-button text-black font-semibold">
                Get Started
              </Button>
            </div>}

          {/* Mobile menu button */}
          <button className="md:hidden text-matrix-green hover:text-matrix-lime" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && <div className="md:hidden border-t border-matrix-green/20 bg-black/95 backdrop-blur">
          <div className="px-4 py-6 space-y-4">
            {navigation.map(item => (
              <Link key={item.name} to={item.href} className="block text-matrix-green hover:text-matrix-lime transition-colors" onClick={() => setIsMenuOpen(false)}>
                {item.name}
              </Link>
            ))}
            
            {!user && <div className="pt-4 border-t border-matrix-green/20 space-y-4">
                <Button variant="ghost" onClick={() => {
            navigate('/auth');
            setIsMenuOpen(false);
          }} className="w-full text-matrix-green hover:text-matrix-lime hover:bg-matrix-green/10">
                  Sign In
                </Button>
                <Button onClick={() => {
            navigate('/auth', {
              state: {
                signUp: true
              }
            });
            setIsMenuOpen(false);
          }} className="w-full glow-button text-black font-semibold">
                  Get Started
                </Button>
              </div>}
          </div>
        </div>}
    </header>;
};
export default Header;