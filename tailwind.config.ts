
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				// Brand colors for GenerativeSearch.pro style
				'matrix-green': 'hsl(var(--matrix-green))',
				'matrix-green-neon': 'hsl(var(--matrix-green-neon))',
				'info-blue': 'hsl(var(--info-blue))',
				'primary-neon': 'hsl(var(--primary-neon))',
				'success': 'hsl(120 85% 60%)',
				'warning': 'hsl(60 100% 50%)',
				'error': 'hsl(0 100% 50%)',
				'info': 'hsl(var(--info-blue))',
				'auth-gradient-start': 'hsl(var(--auth-gradient-start))',
				'auth-gradient-end': 'hsl(var(--auth-gradient-end))'
			},
			fontFamily: {
				'display': ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				'body': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				'sans': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'body': ['16px', '1.45'],
			},
			spacing: {
				'section': '96px',
				'h2-top': '48px',
				'h3-top': '24px',
				'card-gap-x': '32px',
				'card-gap-y': '64px',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'glow-pulse': {
					'0%, 100%': {
						'box-shadow': '0 0 20px hsl(120 100% 50% / 0.3)'
					},
					'50%': {
						'box-shadow': '0 0 30px hsl(120 100% 50% / 0.5)'
					}
				},
				'spin-slow': {
					'0%': {
						transform: 'rotate(0deg)'
					},
					'100%': {
						transform: 'rotate(360deg)'
					}
				},
				'progress-fill': {
					'0%': {
						'stroke-dasharray': '0 251.2'
					},
					'100%': {
						'stroke-dasharray': 'var(--dash-array) 251.2'
					}
				},
				'skeleton-pulse': {
					'0%, 100%': {
						opacity: '0.15'
					},
					'50%': {
						opacity: '0.3'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'spin-slow': 'spin-slow 3s linear infinite',
				'progress-fill': 'progress-fill 1s ease-out',
				'skeleton-pulse': 'skeleton-pulse 1.4s ease-in-out infinite'
			},
			boxShadow: {
				'glow': '0 0 20px hsl(120 100% 50% / 0.3)',
				'glow-lg': '0 0 30px hsl(120 100% 50% / 0.4)',
				'glow-xl': '0 0 40px hsl(120 100% 50% / 0.5)',
				'card': '0 4px 6px -1px hsl(220 13% 4% / 0.3), 0 2px 4px -1px hsl(220 13% 4% / 0.2)',
				'card-hover': '0 10px 15px -3px hsl(220 13% 4% / 0.4), 0 4px 6px -2px hsl(220 13% 4% / 0.3)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
