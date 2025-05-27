
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  LogOut, 
  Settings, 
  Crown, 
  ChevronDown,
  Search,
  Globe,
  Code
} from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userCredits, setUserCredits] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserCredits();
    }
  }, [user]);

  const fetchUserCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_user_credits')
        .select('remaining_credits')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
        return;
      }

      setUserCredits(data?.remaining_credits || 0);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/content-generator', label: 'Content Generator' },
    { path: '/content-history', label: 'Content History' },
    { path: '/domain-analysis', label: 'Domain Analysis' },
  ];

  const aiToolsItems = [
    { path: '/schema-analysis', label: 'Schema Analyzer', icon: Code },
    { path: '/citation-checker', label: 'Citation Checker', icon: Search },
    { path: '/ai-sitemap', label: 'AI Sitemap', icon: Globe },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/06f84961-215a-4c1a-855e-bd2ba1c43691.png" 
                alt="GenerativeSearch.pro" 
                className="h-8 w-8"
                style={{ background: 'transparent' }}
              />
              <span className="text-xl font-bold text-gray-900">GenerativeSearch.pro</span>
            </Link>
            
            {user && (
              <nav className="hidden md:flex space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                      isActivePath(item.path) 
                        ? 'text-blue-600 border-b-2 border-blue-600 pb-4' 
                        : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* AI Tools Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                        aiToolsItems.some(item => isActivePath(item.path))
                          ? 'text-blue-600' 
                          : 'text-gray-500'
                      }`}
                    >
                      AI Tools
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {aiToolsItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.path} asChild>
                          <Link 
                            to={item.path}
                            className={`flex items-center w-full ${
                              isActivePath(item.path) ? 'bg-blue-50 text-blue-600' : ''
                            }`}
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {userCredits !== null && (
                  <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                    <span>Credits:</span>
                    <span className="font-semibold text-blue-600">{userCredits}</span>
                  </div>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/upgrade" className="flex items-center">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
