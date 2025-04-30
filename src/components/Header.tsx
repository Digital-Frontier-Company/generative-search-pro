
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Search, BellRing, Moon, Sun, Menu, X, LogOut, Shield 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Header = ({ isAuthenticated = false }: { isAuthenticated?: boolean }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  
  // Automatically determine authentication status from auth context
  const isUserAuthenticated = !!user || isAuthenticated;
  
  // Placeholder for theme toggle (to be implemented)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  
  const handleLogin = () => navigate('/auth');
  const handleSignUp = () => navigate('/auth', { state: { signUp: true } });
  const handleDashboard = () => navigate('/dashboard');
  const handleAdmin = () => navigate('/admin');
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("You've been signed out successfully");
      navigate('/');
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="w-full px-4 py-3 border-b border-gray-100 bg-white">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-aeo-blue to-aeo-purple flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">FrontierAEO</span>
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {isUserAuthenticated ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>Dashboard</Button>
              <Button variant="ghost" onClick={() => navigate('/history')}>History</Button>
              <Button variant="ghost" onClick={() => navigate('/admin')}>Admin</Button>
              <Button variant="ghost" onClick={() => navigate('/settings')}>Settings</Button>
            </>
          ) : (
            <>
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#examples" className="text-gray-600 hover:text-gray-900 transition-colors">Examples</a>
            </>
          )}
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isUserAuthenticated ? (
            <>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <BellRing className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={toggleTheme}>
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="h-6 w-px bg-gray-200 mx-1"></div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-aeo-blue/20 flex items-center justify-center">
                      <span className="font-medium text-sm text-aeo-blue">{getUserInitials()}</span>
                    </div>
                    <span className="hidden sm:inline-block">{user?.email?.split('@')[0] || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDashboard}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAdmin}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleLogin}>Login</Button>
              <Button onClick={handleSignUp}>Sign Up Free</Button>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-md p-4 z-10 animate-fade-in">
          <div className="flex flex-col space-y-3">
            {isUserAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}>
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => { navigate('/history'); setIsMobileMenuOpen(false); }}>
                  History
                </Button>
                <Button variant="ghost" onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }}>
                  Admin
                </Button>
                <Button variant="ghost" onClick={() => { navigate('/settings'); setIsMobileMenuOpen(false); }}>
                  Settings
                </Button>
                <div className="h-px bg-gray-200 my-2"></div>
                <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <a href="#features" className="py-2 px-3 rounded-md hover:bg-gray-50">Features</a>
                <a href="#pricing" className="py-2 px-3 rounded-md hover:bg-gray-50">Pricing</a>
                <a href="#examples" className="py-2 px-3 rounded-md hover:bg-gray-50">Examples</a>
                <div className="h-px bg-gray-200 my-2"></div>
                <Button variant="outline" onClick={() => { handleLogin(); setIsMobileMenuOpen(false); }}>
                  Login
                </Button>
                <Button onClick={() => { handleSignUp(); setIsMobileMenuOpen(false); }}>
                  Sign Up Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
