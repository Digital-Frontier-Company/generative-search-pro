
import { Github, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-aeo-blue to-aeo-purple flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <span className="font-bold text-xl">FrontierAEO</span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs">
              Generate optimized content for search engines and AI answer boxes with just a few clicks.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-gray-500 hover:text-gray-900">
                <Github size={20} />
              </a>
              <a href="https://twitter.com" className="text-gray-500 hover:text-gray-900">
                <Twitter size={20} />
              </a>
              <a href="mailto:contact@frontieraeo.com" className="text-gray-500 hover:text-gray-900">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="/features" className="text-gray-500 text-sm hover:text-aeo-blue">Features</a></li>
              <li><a href="/pricing" className="text-gray-500 text-sm hover:text-aeo-blue">Pricing</a></li>
              <li><a href="/examples" className="text-gray-500 text-sm hover:text-aeo-blue">Examples</a></li>
              <li><a href="/roadmap" className="text-gray-500 text-sm hover:text-aeo-blue">Roadmap</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="/docs" className="text-gray-500 text-sm hover:text-aeo-blue">Documentation</a></li>
              <li><a href="/blog" className="text-gray-500 text-sm hover:text-aeo-blue">Blog</a></li>
              <li><a href="/support" className="text-gray-500 text-sm hover:text-aeo-blue">Support</a></li>
              <li><a href="/community" className="text-gray-500 text-sm hover:text-aeo-blue">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-500 text-sm hover:text-aeo-blue">About</a></li>
              <li><a href="/contact" className="text-gray-500 text-sm hover:text-aeo-blue">Contact</a></li>
              <li><a href="/terms" className="text-gray-500 text-sm hover:text-aeo-blue">Terms</a></li>
              <li><a href="/privacy" className="text-gray-500 text-sm hover:text-aeo-blue">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} FrontierAEO. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/terms" className="text-gray-500 text-xs hover:text-aeo-blue">Terms of Service</a>
            <a href="/privacy" className="text-gray-500 text-xs hover:text-aeo-blue">Privacy Policy</a>
            <a href="/cookies" className="text-gray-500 text-xs hover:text-aeo-blue">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
