
import { Github, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-aeo-navy to-aeo-red flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <span className="font-bold text-xl text-foreground">FrontierAEO</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Generate optimized content for search engines and AI answer boxes with just a few clicks.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-muted-foreground hover:text-foreground">
                <Github size={20} />
              </a>
              <a href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
                <Twitter size={20} />
              </a>
              <a href="mailto:contact@frontieraeo.com" className="text-muted-foreground hover:text-foreground">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4 text-foreground">Product</h3>
            <ul className="space-y-2">
              <li><a href="/features" className="text-muted-foreground text-sm hover:text-aeo-red">Features</a></li>
              <li><a href="/pricing" className="text-muted-foreground text-sm hover:text-aeo-red">Pricing</a></li>
              <li><a href="/examples" className="text-muted-foreground text-sm hover:text-aeo-red">Examples</a></li>
              <li><a href="/roadmap" className="text-muted-foreground text-sm hover:text-aeo-red">Roadmap</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4 text-foreground">Resources</h3>
            <ul className="space-y-2">
              <li><a href="/docs" className="text-muted-foreground text-sm hover:text-aeo-red">Documentation</a></li>
              <li><a href="/blog" className="text-muted-foreground text-sm hover:text-aeo-red">Blog</a></li>
              <li><a href="/support" className="text-muted-foreground text-sm hover:text-aeo-red">Support</a></li>
              <li><a href="/community" className="text-muted-foreground text-sm hover:text-aeo-red">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4 text-foreground">Company</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-muted-foreground text-sm hover:text-aeo-red">About</a></li>
              <li><a href="/contact" className="text-muted-foreground text-sm hover:text-aeo-red">Contact</a></li>
              <li><a href="/terms" className="text-muted-foreground text-sm hover:text-aeo-red">Terms</a></li>
              <li><a href="/privacy" className="text-muted-foreground text-sm hover:text-aeo-red">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} FrontierAEO. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/terms" className="text-muted-foreground text-xs hover:text-aeo-red">Terms of Service</a>
            <a href="/privacy" className="text-muted-foreground text-xs hover:text-aeo-red">Privacy Policy</a>
            <a href="/cookies" className="text-muted-foreground text-xs hover:text-aeo-red">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
