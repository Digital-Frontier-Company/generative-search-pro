import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Settings, CreditCard } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    user,
    signOut
  } = useAuth();
  const {
    subscribed,
    subscriptionTier
  } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  const handleProfileClick = () => {
    navigate('/settings');
  };
  const handleUpgradeClick = () => {
    navigate('/upgrade');
  };
  const navLinks = [{
    to: "/",
    label: "Home"
  }, {
    to: "/about",
    label: "About"
  }, {
    to: "/#features",
    label: "Features"
  }, {
    to: "/#pricing",
    label: "Pricing"
  }, {
    to: "/#examples",
    label: "Examples"
  }];
  return <header className="bg-black/90 backdrop-blur-sm border-b border-matrix-green/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/lovable-uploads/529aa5c1-ba3f-4d12-9363-2f95511fd4bd.png" alt="GenerativeSearch" className="max-h-20 w-auto fill-transparent drop-shadow-[0_0_10px_rgba(0,255,65,0.8)] object-cover" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => <Link key={link.to} to={link.to} className={`text-matrix-green/80 hover:text-matrix-green transition-colors ${location.pathname === link.to ? 'text-matrix-green font-medium' : ''}`}>
                {link.label}
              </Link>)}
            {user && <Link to="/dashboard" className={`text-matrix-green/80 hover:text-matrix-green transition-colors ${location.pathname === '/dashboard' ? 'text-matrix-green font-medium' : ''}`}>
                Dashboard
              </Link>}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? <div className="flex items-center space-x-4">
                {!subscribed && <Button onClick={handleUpgradeClick} className="glow-button text-black font-semibold">
                    Upgrade
                  </Button>}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-matrix-green text-matrix-green hover:bg-matrix-green/10">
                      <User className="w-4 h-4 mr-2" />
                      {user.email?.split('@')[0]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-matrix-dark-gray border-matrix-green/30">
                    <DropdownMenuItem onClick={handleProfileClick} className="text-matrix-green hover:bg-matrix-green/10 cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    {subscribed && <DropdownMenuItem onClick={handleUpgradeClick} className="text-matrix-green hover:bg-matrix-green/10 cursor-pointer">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Manage Subscription
                      </DropdownMenuItem>}
                    <DropdownMenuSeparator className="bg-matrix-green/30" />
                    <DropdownMenuItem onClick={handleSignOut} className="text-matrix-green hover:bg-matrix-green/10 cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div> : <>
                <Button onClick={() => navigate('/auth')} variant="outline" className="border-matrix-green text-matrix-green hover:bg-matrix-green/10">
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth', {
              state: {
                signUp: true
              }
            })} className="glow-button text-black font-semibold">
                  Start Free Trial
                </Button>
              </>}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-matrix-green" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden border-t border-matrix-green/30 py-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map(link => <Link key={link.to} to={link.to} className="text-matrix-green/80 hover:text-matrix-green transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </Link>)}
              
              {user && <Link to="/dashboard" className="text-matrix-green/80 hover:text-matrix-green transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>}
              
              {user ? <div className="flex flex-col space-y-2 pt-4 border-t border-matrix-green/30">
                  <Button onClick={() => {
              handleProfileClick();
              setIsMenuOpen(false);
            }} variant="outline" className="border-matrix-green text-matrix-green hover:bg-matrix-green/10 justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  {!subscribed && <Button onClick={() => {
              handleUpgradeClick();
              setIsMenuOpen(false);
            }} className="glow-button text-black font-semibold justify-start">
                      Upgrade
                    </Button>}
                  <Button onClick={() => {
              handleSignOut();
              setIsMenuOpen(false);
            }} variant="outline" className="border-matrix-green text-matrix-green hover:bg-matrix-green/10 justify-start">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div> : <div className="flex flex-col space-y-2 pt-4 border-t border-matrix-green/30">
                  <Button onClick={() => {
              navigate('/auth');
              setIsMenuOpen(false);
            }} variant="outline" className="border-matrix-green text-matrix-green hover:bg-matrix-green/10 justify-start">
                    Sign In
                  </Button>
                  <Button onClick={() => {
              navigate('/auth', {
                state: {
                  signUp: true
                }
              });
              setIsMenuOpen(false);
            }} className="glow-button text-black font-semibold justify-start">
                    Start Free Trial
                  </Button>
                </div>}
            </div>
          </div>}
      </div>
    </header>;
};
export default Header;