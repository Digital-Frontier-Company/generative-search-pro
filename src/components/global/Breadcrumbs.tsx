
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

interface BreadcrumbsProps {
  customBreadcrumbs?: { label: string; path: string }[];
}

const Breadcrumbs = ({ customBreadcrumbs }: BreadcrumbsProps) => {
  const location = useLocation();
  
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const getPageLabel = (segment: string) => {
    const labels: Record<string, string> = {
      'dashboard': 'Dashboard',
      'generator': 'Content Generator',
      'history': 'Content History',
      'seo-analysis': 'SEO Analysis',
      'domain-analysis': 'Domain Analysis',
      'schema-analysis': 'AI Visibility Score',
      'citation-checker': 'Citation Checker',
      'ai-sitemap': 'AI Sitemap Generator',
      'settings': 'Settings',
      'upgrade': 'Upgrade',
      'about': 'About',
      'auth': 'Authentication',
      'admin': 'Admin'
    };
    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const breadcrumbs = customBreadcrumbs || pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    return {
      label: getPageLabel(segment),
      path
    };
  });

  if (location.pathname === '/') {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <div className="container mx-auto px-4 py-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1">
                <Home className="w-4 h-4" />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.path} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={breadcrumb.path}>{breadcrumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default Breadcrumbs;
