
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="text-white shadow-lg bg-black/[0.81]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/559b3fdd-e727-4d4a-9e59-0562bba2ab61.png" 
              alt="GenerativeSearch.pro" 
              className="h-8 w-auto" 
            />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/#features" className="hover:text-purple-400 transition-colors">
              Features
            </Link>
            <Link to="/#pricing" className="hover:text-purple-400 transition-colors">
              Pricing
            </Link>
            <Link to="/#examples" className="hover:text-purple-400 transition-colors">
              Examples
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="hover:text-gray-300 transition-colors">
                  Dashboard
                </Link>
                <Link to="/content-generator" className="hover:text-gray-300 transition-colors">
                  Generate Content
                </Link>
                <Link to="/content-history" className="hover:text-gray-300 transition-colors">
                  Content History
                </Link>
                <Link to="/domain-analysis" className="hover:text-gray-300 transition-colors">
                  Domain Analysis
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="Avatar" />
                      <AvatarFallback>{user.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/upgrade')}>Upgrade</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate('/auth', { state: { signUp: false } })} 
                variant="outline" 
                className="text-slate-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-none"
              >
                Sign In
              </Button>
            )}
            
            <Sheet>
              <SheetTrigger className="md:hidden">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="right" className="sm:w-2/3 md:w-1/2 lg:w-1/3">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Explore FrontierAEO
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <Link to="/#features" className="hover:text-gray-700 transition-colors block py-2">
                    Features
                  </Link>
                  <Link to="/#pricing" className="hover:text-gray-700 transition-colors block py-2">
                    Pricing
                  </Link>
                  <Link to="/#examples" className="hover:text-gray-700 transition-colors block py-2">
                    Examples
                  </Link>
                  {user && (
                    <>
                      <Link to="/dashboard" className="hover:text-gray-700 transition-colors block py-2">
                        Dashboard
                      </Link>
                      <Link to="/content-generator" className="hover:text-gray-700 transition-colors block py-2">
                        Generate Content
                      </Link>
                      <Link to="/content-history" className="hover:text-gray-700 transition-colors block py-2">
                        Content History
                      </Link>
                      <Link to="/domain-analysis" className="hover:text-gray-700 transition-colors block py-2">
                        Domain Analysis
                      </Link>
                      <Link to="/settings" className="hover:text-gray-700 transition-colors block py-2">
                        Settings
                      </Link>
                      <Link to="/upgrade" className="hover:text-gray-700 transition-colors block py-2">
                        Upgrade
                      </Link>
                    </>
                  )}
                  {!user && (
                    <Button 
                      onClick={() => navigate('/auth', { state: { signUp: false } })} 
                      variant="outline"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
