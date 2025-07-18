import { Github, Twitter, Mail } from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";
const Footer = () => {
  return <footer className="bg-black border-t border-matrix-green/30">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <OptimizedImage src="/lovable-uploads/96aa1ceb-6858-443c-8bc7-1f9af19024d5.png" alt="GenerativeSearch" style={{ background: 'transparent' }} className="h-20 filter drop-shadow-[0_0_10px_rgba(0,255,65,0.8)] object-contain" />
            </div>
            <p className="text-matrix-green/70 text-sm max-w-xs">
              Generate optimized content for search engines and AI answer boxes with just a few clicks.
            </p>
            
            <div className="flex space-x-4">
              <a href="https://github.com" aria-label="GitHub" className="text-matrix-green/70 hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">
                <Github size={20} />
              </a>
              <a href="https://twitter.com" aria-label="Twitter" className="text-matrix-green/70 hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">
                <Twitter size={20} />
              </a>
              <a href="mailto:contact@frontieraeo.com" aria-label="Email" className="text-matrix-green/70 hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4 text-matrix-green">Product</h3>
            <ul className="space-y-2">
              <li><a href="/features" className="text-matrix-green/70 text-sm hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Features</a></li>
              <li><a href="/pricing" className="text-matrix-green/70 text-sm hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Pricing</a></li>
              <li><a href="/examples" className="text-matrix-green/70 text-sm hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Examples</a></li>
              <li><a href="/roadmap" className="text-matrix-green/70 text-sm hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Roadmap</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4 text-matrix-green">Resources</h3>
            <ul className="space-y-2">
              <li><a href="/docs" className="text-matrix-green/70 text-sm hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Documentation</a></li>
              <li><a href="/blog" className="text-matrix-green/70 text-sm hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Blog</a></li>
              <li><a href="/support" className="text-matrix-green/70 text-sm hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Support</a></li>
              <li><a href="/community" className="text-matrix-green/70 text-sm hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4 text-matrix-green">Company</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-matrix-green/70 text-sm hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">About</a></li>
              <li><a href="/contact" className="text-matrix-green/70 text-sm hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Contact</a></li>
              <li><a href="/terms" className="text-matrix-green/70 text-sm hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Terms</a></li>
              <li><a href="/privacy" className="text-matrix-green/70 text-sm hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-matrix-green/30 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <p className="text-matrix-green/70 text-xs">
              Website created by
            </p>
            <a href="https://digitalfrontier.app" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
              <OptimizedImage src="/lovable-uploads/0fe6567b-9ca7-43bd-92f5-76dc6e40c9aa.png" alt="Digital Frontier" className="h-4 filter drop-shadow-[0_0_8px_rgba(0,255,65,0.6)]" style={{ background: 'transparent' }} />
            </a>
            <p className="text-matrix-green/70 text-xs">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/terms" className="text-matrix-green/70 text-xs hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Terms of Service</a>
            <a href="/privacy" className="text-matrix-green/70 text-xs hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Privacy Policy</a>
            <a href="/cookies" className="text-matrix-green/70 text-xs hover:text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;