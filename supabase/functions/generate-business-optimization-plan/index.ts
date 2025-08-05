import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { business_type, template, domain, user_id } = await req.json()
    
    if (!business_type || !template || !user_id) {
      throw new Error('Business type, template, and user_id are required')
    }

    console.log('Generating business optimization plan for:', business_type)
    
    // Generate customized optimization plan
    const optimizationPlan = await generateCustomizedPlan(business_type, template, domain);
    
    // Store plan in database
    await storeOptimizationPlan({
      user_id,
      business_type,
      domain,
      plan: optimizationPlan
    });

    return new Response(
      JSON.stringify({
        success: true,
        plan: optimizationPlan,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in generate-business-optimization-plan:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function generateCustomizedPlan(businessType: string, template: any, domain?: string) {
  // Generate customized actions based on business type and domain
  const customizedActions = generateCustomizedActions(businessType, template, domain);
  
  // Set KPI targets based on business type
  const kpiTargets = generateKPITargets(businessType, template);
  
  // Generate next steps
  const nextSteps = generateNextSteps(businessType, template);

  return {
    businessType,
    template,
    customizedActions,
    kpiTargets,
    nextSteps,
    generatedAt: new Date().toISOString()
  };
}

function generateCustomizedActions(businessType: string, template: any, domain?: string) {
  const actions = [];

  // Phase 1 Actions (Foundation)
  template.optimizationStrategy.phase1.forEach((action: string, index: number) => {
    actions.push({
      phase: 'Phase 1: Foundation',
      action: customizeActionForDomain(action, businessType, domain),
      priority: index === 0 ? 'high' : 'medium',
      estimatedTime: getEstimatedTime(action, businessType),
      expectedImpact: getExpectedImpact(action, businessType)
    });
  });

  // Phase 2 Actions (Growth)
  template.optimizationStrategy.phase2.forEach((action: string, index: number) => {
    actions.push({
      phase: 'Phase 2: Growth',
      action: customizeActionForDomain(action, businessType, domain),
      priority: index < 2 ? 'high' : 'medium',
      estimatedTime: getEstimatedTime(action, businessType),
      expectedImpact: getExpectedImpact(action, businessType)
    });
  });

  // Phase 3 Actions (Scale)
  template.optimizationStrategy.phase3.forEach((action: string, index: number) => {
    actions.push({
      phase: 'Phase 3: Scale',
      action: customizeActionForDomain(action, businessType, domain),
      priority: 'medium',
      estimatedTime: getEstimatedTime(action, businessType),
      expectedImpact: getExpectedImpact(action, businessType)
    });
  });

  // Add business-specific actions
  const specificActions = getBusinessSpecificActions(businessType, domain);
  actions.push(...specificActions);

  return actions;
}

function customizeActionForDomain(action: string, businessType: string, domain?: string) {
  let customizedAction = action;
  
  // Add domain-specific context if available
  if (domain) {
    const domainName = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0];
    customizedAction = customizedAction.replace(/your (product|service|business|site)/g, `${domainName}'s $1`);
  }

  // Add business-type specific context
  switch (businessType) {
    case 'b2b_saas':
      customizedAction = customizedAction.replace(/content/, 'technical documentation and feature content');
      break;
    case 'ecommerce':
      customizedAction = customizedAction.replace(/content/, 'product pages and shopping guides');
      break;
    case 'local_service':
      customizedAction = customizedAction.replace(/content/, 'location-based service content');
      break;
    case 'healthcare':
      customizedAction = customizedAction.replace(/content/, 'medical information and patient resources');
      break;
    case 'education':
      customizedAction = customizedAction.replace(/content/, 'course information and educational resources');
      break;
    case 'professional_services':
      customizedAction = customizedAction.replace(/content/, 'expertise and case study content');
      break;
  }

  return customizedAction;
}

function getEstimatedTime(action: string, businessType: string): string {
  // Base time estimates
  const timeMap: Record<string, string> = {
    'optimize': '1-2 weeks',
    'create': '2-3 weeks', 
    'implement': '1-2 weeks',
    'build': '3-4 weeks',
    'scale': '4-6 weeks',
    'advanced': '6-8 weeks'
  };

  // Find matching keyword
  const keyword = Object.keys(timeMap).find(key => 
    action.toLowerCase().includes(key)
  );

  let baseTime = keyword ? timeMap[keyword] : '2-3 weeks';

  // Adjust for business complexity
  if (businessType === 'healthcare' || businessType === 'education') {
    // These require more compliance and accuracy
    const [min, max] = baseTime.split('-').map(t => parseInt(t));
    baseTime = `${min + 1}-${max + 1} weeks`;
  }

  return baseTime;
}

function getExpectedImpact(action: string, businessType: string): string {
  const impactKeywords = {
    'high': ['optimize', 'implement', 'create comprehensive'],
    'medium': ['build', 'develop', 'enhance'],
    'low': ['adjust', 'update', 'refine']
  };

  for (const [impact, keywords] of Object.entries(impactKeywords)) {
    if (keywords.some(keyword => action.toLowerCase().includes(keyword))) {
      return `${impact} impact`;
    }
  }

  return 'medium impact';
}

function getBusinessSpecificActions(businessType: string, domain?: string) {
  const actions = [];

  switch (businessType) {
    case 'b2b_saas':
      actions.push(
        {
          phase: 'Phase 2: Growth',
          action: 'Create developer onboarding content and API documentation optimization',
          priority: 'high',
          estimatedTime: '3-4 weeks',
          expectedImpact: 'high impact'
        },
        {
          phase: 'Phase 3: Scale',
          action: 'Implement integration marketplace content strategy',
          priority: 'medium',
          estimatedTime: '4-5 weeks',
          expectedImpact: 'medium impact'
        }
      );
      break;

    case 'ecommerce':
      actions.push(
        {
          phase: 'Phase 1: Foundation',
          action: 'Optimize product catalog for AI shopping assistants',
          priority: 'high',
          estimatedTime: '2-3 weeks',
          expectedImpact: 'high impact'
        },
        {
          phase: 'Phase 2: Growth',
          action: 'Create seasonal shopping guides and gift recommendations',
          priority: 'medium',
          estimatedTime: '3-4 weeks',
          expectedImpact: 'medium impact'
        }
      );
      break;

    case 'local_service':
      actions.push(
        {
          phase: 'Phase 1: Foundation',
          action: 'Optimize for emergency and urgent service queries',
          priority: 'high',
          estimatedTime: '1-2 weeks',
          expectedImpact: 'high impact'
        },
        {
          phase: 'Phase 2: Growth',
          action: 'Create neighborhood-specific service content',
          priority: 'medium',
          estimatedTime: '2-3 weeks',
          expectedImpact: 'medium impact'
        }
      );
      break;

    case 'healthcare':
      actions.push(
        {
          phase: 'Phase 1: Foundation',
          action: 'Ensure medical content accuracy and HIPAA compliance',
          priority: 'high',
          estimatedTime: '2-3 weeks',
          expectedImpact: 'high impact'
        },
        {
          phase: 'Phase 2: Growth',
          action: 'Create symptom checker and self-assessment content',
          priority: 'medium',
          estimatedTime: '4-5 weeks',
          expectedImpact: 'medium impact'
        }
      );
      break;

    case 'education':
      actions.push(
        {
          phase: 'Phase 1: Foundation',
          action: 'Create course comparison and career outcome content',
          priority: 'high',
          estimatedTime: '2-3 weeks',
          expectedImpact: 'high impact'
        },
        {
          phase: 'Phase 3: Scale',
          action: 'Develop alumni success story and testimonial content',
          priority: 'medium',
          estimatedTime: '3-4 weeks',
          expectedImpact: 'medium impact'
        }
      );
      break;

    case 'professional_services':
      actions.push(
        {
          phase: 'Phase 1: Foundation',
          action: 'Create legal disclaimer and consultation booking optimization',
          priority: 'high',
          estimatedTime: '1-2 weeks',
          expectedImpact: 'high impact'
        },
        {
          phase: 'Phase 2: Growth',
          action: 'Develop industry-specific thought leadership content',
          priority: 'medium',
          estimatedTime: '4-5 weeks',
          expectedImpact: 'medium impact'
        }
      );
      break;
  }

  return actions;
}

function generateKPITargets(businessType: string, template: any) {
  const baseTargets = {
    overallAIVisibilityScore: 75,
    citationRate: 35,
    zeroClickCapture: 25,
    voiceSearchVisibility: 30
  };

  // Adjust targets based on business type
  switch (businessType) {
    case 'b2b_saas':
      return {
        ...baseTargets,
        technicalDocumentationVisibility: 80,
        developerQueryCapture: 40,
        trialSignupsFromAI: 15
      };

    case 'ecommerce':
      return {
        ...baseTargets,
        productPageAIVisibility: 70,
        shoppingGuideTraffic: 45,
        conversionFromZeroClick: 8
      };

    case 'local_service':
      return {
        ...baseTargets,
        localAIMentionRate: 60,
        voiceSearchVisibility: 50,
        emergencyQueryCapture: 70
      };

    case 'healthcare':
      return {
        ...baseTargets,
        medicalQueryVisibility: 65,
        patientEducationEngagement: 55,
        appointmentBookingConversions: 12
      };

    case 'education':
      return {
        ...baseTargets,
        courseInquiryGeneration: 40,
        educationalContentVisibility: 70,
        enrollmentConversions: 10
      };

    case 'professional_services':
      return {
        ...baseTargets,
        consultationRequestGeneration: 35,
        expertiseVisibility: 75,
        caseStudyEngagement: 45
      };

    default:
      return baseTargets;
  }
}

function generateNextSteps(businessType: string, template: any) {
  const commonSteps = [
    'Begin with Phase 1 foundation activities to establish AI-first content structure',
    'Set up tracking and measurement systems for AI visibility metrics',
    'Create a content calendar aligned with your business-specific priorities'
  ];

  const businessSpecificSteps: Record<string, string[]> = {
    'b2b_saas': [
      'Audit existing technical documentation for AI optimization opportunities',
      'Identify top developer queries and create comprehensive answers',
      'Set up developer community engagement and feedback loops'
    ],
    'ecommerce': [
      'Optimize product catalog data for AI shopping assistants',
      'Create seasonal content calendar for shopping guides',
      'Implement product review and rating optimization'
    ],
    'local_service': [
      'Claim and optimize all local business listings',
      'Create emergency service content for urgent queries',
      'Set up location-specific content management system'
    ],
    'healthcare': [
      'Ensure all medical content is reviewed by qualified professionals',
      'Implement patient privacy and HIPAA compliance measures',
      'Create patient education resource library'
    ],
    'education': [
      'Develop comprehensive course information and outcome data',
      'Create student success stories and career placement content',
      'Implement admission and enrollment funnel optimization'
    ],
    'professional_services': [
      'Develop thought leadership content calendar',
      'Create case study template and collection process',
      'Implement consultation booking and client onboarding optimization'
    ]
  };

  return [...commonSteps, ...(businessSpecificSteps[businessType] || [])];
}

async function storeOptimizationPlan(data: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    await fetch(`${supabaseUrl}/rest/v1/business_optimization_plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id: data.user_id,
        business_type: data.business_type,
        domain: data.domain,
        customized_actions: data.plan.customizedActions,
        kpi_targets: data.plan.kpiTargets,
        next_steps: data.plan.nextSteps,
        template_data: data.plan.template,
        generated_at: new Date().toISOString()
      }),
    });
  } catch (error) {
    console.error('Failed to store optimization plan:', error);
  }
}