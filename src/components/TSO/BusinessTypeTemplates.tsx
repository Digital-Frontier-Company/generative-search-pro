import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  ShoppingCart, 
  MapPin, 
  Stethoscope, 
  GraduationCap, 
  Briefcase,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Clock,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDomain } from '@/contexts/DomainContext';

interface BusinessTypeTemplate {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  seoWeight: number;
  aeoWeight: number;
  geoWeight: number;
  keyFocusAreas: string[];
  criticalMetrics: string[];
  contentPriorities: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    examples: string[];
  }>;
  optimizationStrategy: {
    phase1: string[];
    phase2: string[];
    phase3: string[];
  };
  aiPlatformFocus: string[];
  expectedTimeline: string;
}

interface OptimizationPlan {
  businessType: string;
  template: BusinessTypeTemplate;
  customizedActions: Array<{
    phase: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTime: string;
    expectedImpact: string;
  }>;
  kpiTargets: Record<string, number>;
  nextSteps: string[];
  generatedAt: string;
}

const BusinessTypeTemplates = () => {
  const { user } = useAuth();
  const { defaultDomain } = useDomain();
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');
  const [optimizationPlan, setOptimizationPlan] = useState<OptimizationPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');

  const businessTypes: BusinessTypeTemplate[] = [
    {
      id: 'b2b_saas',
      name: 'B2B SaaS',
      icon: Building2,
      description: 'Software-as-a-Service companies targeting business customers',
      seoWeight: 30,
      aeoWeight: 40,
      geoWeight: 30,
      keyFocusAreas: [
        'Feature documentation',
        'Integration guides', 
        'Use case explanations',
        'ROI calculations',
        'Comparison content'
      ],
      criticalMetrics: [
        'Trial signups from AI referrals',
        'Feature adoption rates',
        'Demo requests',
        'Technical documentation visibility'
      ],
      contentPriorities: [
        {
          type: 'Technical Documentation',
          priority: 'high',
          description: 'Comprehensive API docs, integration guides, and technical specifications',
          examples: ['API reference guides', 'SDK documentation', 'Integration tutorials']
        },
        {
          type: 'Use Case Content',
          priority: 'high', 
          description: 'Detailed explanations of how different industries use your solution',
          examples: ['Industry case studies', 'Workflow examples', 'ROI calculators']
        },
        {
          type: 'Comparison Content',
          priority: 'medium',
          description: 'Feature comparisons and competitive analysis',
          examples: ['Vs competitor pages', 'Feature comparison tables', 'Migration guides']
        }
      ],
      optimizationStrategy: {
        phase1: [
          'Optimize product feature pages for AI discovery',
          'Create comprehensive FAQ sections',
          'Implement technical schema markup'
        ],
        phase2: [
          'Build use case and integration content clusters',
          'Optimize for developer-focused queries',
          'Create comparison and alternative content'
        ],
        phase3: [
          'Scale content across all product features',  
          'Implement advanced technical SEO',
          'Build authority through thought leadership'
        ]
      },
      aiPlatformFocus: ['ChatGPT', 'Claude', 'Perplexity'],
      expectedTimeline: '3-6 months'
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      icon: ShoppingCart,
      description: 'Online retail businesses selling products directly to consumers',
      seoWeight: 45,
      aeoWeight: 35,
      geoWeight: 20,
      keyFocusAreas: [
        'Product information optimization',
        'Category page structure',
        'Review and rating content',
        'Shopping guides',
        'Price comparison'
      ],
      criticalMetrics: [
        'Product page AI visibility',
        'Conversion from zero-click searches',
        'Shopping guide traffic',
        'Review snippet captures'
      ],
      contentPriorities: [
        {
          type: 'Product Information',
          priority: 'high',
          description: 'Detailed product descriptions, specifications, and usage information',
          examples: ['Product descriptions', 'Specification sheets', 'Size guides']
        },
        {
          type: 'Shopping Guides',
          priority: 'high',
          description: 'Buying guides, comparison content, and educational material',
          examples: ['Buying guides', 'Product comparisons', 'How-to-choose articles']
        },
        {
          type: 'Review Content',
          priority: 'medium',
          description: 'User reviews, ratings, and social proof content',
          examples: ['Customer reviews', 'Expert reviews', 'Product ratings']
        }
      ],
      optimizationStrategy: {
        phase1: [
          'Optimize product pages with rich snippets',
          'Implement product schema markup',
          'Create shopping guide content'
        ],
        phase2: [
          'Build category-specific buying guides',
          'Optimize for shopping intent queries',
          'Implement review and rating schemas'
        ],
        phase3: [
          'Scale across entire product catalog',
          'Advanced product feed optimization',
          'Multi-channel shopping visibility'
        ]
      },
      aiPlatformFocus: ['Google Shopping', 'ChatGPT', 'Perplexity'],
      expectedTimeline: '2-4 months'
    },
    {
      id: 'local_service',
      name: 'Local Service',
      icon: MapPin,
      description: 'Location-based businesses serving local customers',
      seoWeight: 50,
      aeoWeight: 40,
      geoWeight: 10,
      keyFocusAreas: [
        'Location-based optimization',
        'Service area coverage',
        'Local review management',
        'Service-specific content',
        'Emergency/urgent queries'
      ],
      criticalMetrics: [
        'Local AI mention rates',
        'Voice search visibility',
        'Service area coverage',
        'Review snippet captures'
      ],
      contentPriorities: [
        {
          type: 'Location Content',
          priority: 'high',
          description: 'Location-specific service pages and area coverage',
          examples: ['Service area pages', 'Location landing pages', 'Local case studies']
        },
        {
          type: 'Service Information',
          priority: 'high',
          description: 'Detailed service descriptions, processes, and pricing',
          examples: ['Service descriptions', 'Process explanations', 'Pricing guides']
        },
        {
          type: 'Local Authority',
          priority: 'medium',
          description: 'Community involvement, local partnerships, and expertise',
          examples: ['Community involvement', 'Local partnerships', 'Local expertise']
        }
      ],
      optimizationStrategy: {
        phase1: [
          'Optimize Google Business Profile',
          'Create location-specific service pages',
          'Implement local business schema'
        ],
        phase2: [
          'Build service area content clusters',
          'Optimize for voice search queries',
          'Create local authority content'
        ],
        phase3: [
          'Scale across all service areas',
          'Advanced local SEO strategies',
          'Multi-location optimization'
        ]
      },
      aiPlatformFocus: ['Google Assistant', 'Siri', 'Alexa'],
      expectedTimeline: '2-3 months'
    },
    {
      id: 'healthcare',  
      name: 'Healthcare',
      icon: Stethoscope,
      description: 'Medical practices, clinics, and healthcare service providers',
      seoWeight: 40,
      aeoWeight: 45,
      geoWeight: 15,
      keyFocusAreas: [
        'Medical expertise content',
        'Condition and treatment info',
        'Patient education',
        'Appointment booking',
        'Emergency information'
      ],
      criticalMetrics: [
        'Medical query visibility',
        'Patient education engagement',
        'Appointment booking conversions',
        'Emergency query responses'
      ],
      contentPriorities: [
        {
          type: 'Medical Information',
          priority: 'high',
          description: 'Accurate, authoritative medical content and treatment information',
          examples: ['Condition explanations', 'Treatment options', 'Prevention tips']
        },
        {
          type: 'Patient Resources',
          priority: 'high',
          description: 'Patient education, preparation guides, and care instructions',
          examples: ['Patient guides', 'Preparation instructions', 'Post-care advice']
        },
        {
          type: 'Practice Information',
          priority: 'medium',
          description: 'Provider credentials, specialties, and practice details',
          examples: ['Doctor bios', 'Specialties', 'Insurance information']
        }
      ],
      optimizationStrategy: {
        phase1: [
          'Create authoritative medical content',
          'Implement medical schema markup',
          'Optimize for health queries'
        ],
        phase2: [
          'Build comprehensive patient resources',
          'Optimize for symptom-based searches',
          'Create condition-specific content'
        ],
        phase3: [
          'Scale across all medical specialties',
          'Advanced health authority building',
          'Multi-condition optimization'
        ]
      },
      aiPlatformFocus: ['ChatGPT', 'Claude', 'Medical AI assistants'],
      expectedTimeline: '4-6 months'
    },
    {
      id: 'education',
      name: 'Education',
      icon: GraduationCap,
      description: 'Educational institutions, online courses, and training providers',
      seoWeight: 35,
      aeoWeight: 50,
      geoWeight: 15,
      keyFocusAreas: [
        'Course information',
        'Learning outcomes',
        'Curriculum details',
        'Admission requirements',
        'Career prospects'
      ],
      criticalMetrics: [
        'Course inquiry generation',
        'Educational content visibility',
        'Enrollment conversions',
        'Learning resource engagement'
      ],
      contentPriorities: [
        {
          type: 'Course Content',
          priority: 'high',
          description: 'Detailed course descriptions, curricula, and learning outcomes',
          examples: ['Course catalogs', 'Curriculum details', 'Learning objectives']
        },
        {
          type: 'Student Resources',
          priority: 'high',
          description: 'Study guides, educational materials, and student support',
          examples: ['Study guides', 'Educational resources', 'Student support']
        },
        {
          type: 'Career Information',
          priority: 'medium',
          description: 'Career prospects, job placement rates, and alumni success',
          examples: ['Career outcomes', 'Job placement stats', 'Alumni stories']
        }
      ],
      optimizationStrategy: {
        phase1: [
          'Optimize course and program pages',
          'Create educational content clusters',
          'Implement education schema markup'
        ],
        phase2: [
          'Build comprehensive learning resources',
          'Optimize for career-focused queries',
          'Create admission and enrollment content'
        ],
        phase3: [
          'Scale across all programs',
          'Advanced educational authority',
          'Multi-audience optimization'
        ]
      },
      aiPlatformFocus: ['ChatGPT', 'Claude', 'Educational AI tools'],
      expectedTimeline: '3-5 months'
    },
    {
      id: 'professional_services',
      name: 'Professional Services',
      icon: Briefcase,
      description: 'Law firms, consulting, accounting, and other professional service providers',
      seoWeight: 40,
      aeoWeight: 45,
      geoWeight: 15,
      keyFocusAreas: [
        'Service expertise content',
        'Case studies and results',
        'Industry knowledge',
        'Consultation booking',
        'Legal/compliance info'
      ],
      criticalMetrics: [
        'Consultation request generation',
        'Professional expertise visibility',
        'Case study engagement',
        'Service inquiry conversions'
      ],
      contentPriorities: [
        {
          type: 'Service Content',
          priority: 'high',
          description: 'Detailed service descriptions, processes, and methodologies',
          examples: ['Service descriptions', 'Process explanations', 'Methodology guides']
        },
        {
          type: 'Expertise Content',
          priority: 'high',
          description: 'Industry knowledge, insights, and thought leadership',
          examples: ['Industry insights', 'Thought leadership', 'Best practices']
        },
        {
          type: 'Case Studies',
          priority: 'medium',
          description: 'Client success stories, results, and portfolio work',
          examples: ['Client case studies', 'Success stories', 'Portfolio examples']
        }
      ],
      optimizationStrategy: {
        phase1: [
          'Create comprehensive service pages',
          'Build expertise and authority content',
          'Implement professional service schema'
        ],
        phase2: [
          'Develop industry-specific content',
          'Optimize for consultation queries',
          'Create case study content'
        ],
        phase3: [
          'Scale across all service areas',
          'Advanced professional authority',
          'Multi-industry optimization'
        ]
      },
      aiPlatformFocus: ['ChatGPT', 'Claude', 'Professional AI tools'],
      expectedTimeline: '3-5 months'
    }
  ];

  const generateOptimizationPlan = async (businessTypeId: string) => {
    if (!user) {
      toast.error('Please sign in to generate optimization plan');
      return;
    }

    setLoading(true);
    try {
      const template = businessTypes.find(bt => bt.id === businessTypeId);
      if (!template) {
        throw new Error('Business type template not found');
      }

      const { data, error } = await supabase.functions.invoke('generate-business-optimization-plan', {
        body: JSON.stringify({
          business_type: businessTypeId,
          template,
          domain: defaultDomain,
          user_id: user.id
        })
      });

      if (error) throw error;

      if (data.success) {
        setOptimizationPlan(data.plan);
        setActiveTab('plan');
        toast.success('Optimization plan generated successfully!');
      }
    } catch (error: any) {
      console.error('Optimization plan generation error:', error);
      toast.error(error.message || 'Failed to generate optimization plan');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-matrix-green">Business-Type Optimization Templates</h1>
        <p className="text-matrix-green/70">
          Get customized TSO strategies based on your business type with specific focus areas and optimization priorities.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Business Templates</TabsTrigger>
          <TabsTrigger value="plan">Optimization Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessTypes.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="content-card cursor-pointer hover:border-matrix-green/40 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-matrix-green flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      {template.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-matrix-green/90 text-sm mb-4">{template.description}</p>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-matrix-green/70">SEO Focus</span>
                          <span className="text-xs text-matrix-green">{template.seoWeight}%</span>
                        </div>
                        <Progress value={template.seoWeight} className="h-1" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-matrix-green/70">AEO Focus</span>
                          <span className="text-xs text-matrix-green">{template.aeoWeight}%</span>
                        </div>
                        <Progress value={template.aeoWeight} className="h-1" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-matrix-green/70">GEO Focus</span>
                          <span className="text-xs text-matrix-green">{template.geoWeight}%</span>
                        </div>
                        <Progress value={template.geoWeight} className="h-1" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-matrix-green mb-2">Key Focus Areas</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.keyFocusAreas.slice(0, 3).map((area, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-matrix-green/30 text-matrix-green">
                            {area}
                          </Badge>
                        ))}
                        {template.keyFocusAreas.length > 3 && (
                          <Badge variant="outline" className="text-xs border-matrix-green/30 text-matrix-green">
                            +{template.keyFocusAreas.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => generateOptimizationPlan(template.id)}
                      disabled={loading}
                      className="w-full glow-button text-black font-semibold"
                    >
                      {loading && selectedBusinessType === template.id ? (
                        <>
                          <Target className="w-4 h-4 mr-2 animate-spin" />
                          Generating Plan...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Generate Plan
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="plan">
          {optimizationPlan ? (
            <div className="space-y-6">
              {/* Plan Overview */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {optimizationPlan.template.name} Optimization Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {optimizationPlan.template.expectedTimeline}
                      </div>
                      <p className="text-sm text-matrix-green/70">Expected Timeline</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {optimizationPlan.customizedActions.length}
                      </div>
                      <p className="text-sm text-matrix-green/70">Action Items</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {optimizationPlan.template.aiPlatformFocus.length}
                      </div>
                      <p className="text-sm text-matrix-green/70">AI Platforms</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-matrix-green mb-2">Focus Distribution</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-matrix-green/70">SEO</span>
                            <span className="text-matrix-green">{optimizationPlan.template.seoWeight}%</span>
                          </div>
                          <Progress value={optimizationPlan.template.seoWeight} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-matrix-green/70">AEO</span>
                            <span className="text-matrix-green">{optimizationPlan.template.aeoWeight}%</span>
                          </div>
                          <Progress value={optimizationPlan.template.aeoWeight} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-matrix-green/70">GEO</span>
                            <span className="text-matrix-green">{optimizationPlan.template.geoWeight}%</span>
                          </div>
                          <Progress value={optimizationPlan.template.geoWeight} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Plan */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">Customized Action Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimizationPlan.customizedActions.map((action, index) => (
                      <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {action.phase}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityColor(action.priority)}`}>
                              {action.priority}
                            </Badge>
                          </div>
                        </div>
                        <h4 className="font-semibold text-matrix-green mb-2">{action.action}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-matrix-green/70">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>Time: {action.estimatedTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" />
                            <span>Impact: {action.expectedImpact}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optimizationPlan.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-matrix-green mt-1" />
                        <p className="text-matrix-green/90">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Optimization Plan Generated
                </h3>
                <p className="text-matrix-green/70">
                  Select a business type template and generate a customized optimization plan.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessTypeTemplates;