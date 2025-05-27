
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
				// Updated custom colors for black and green theme
				matrix: {
					'black': '#000000',
					'dark-gray': '#0a0a0a',
					'green': '#00ff41',
					'dark-green': '#008f11',
					'lime': '#32ff32',
					'emerald': '#00ff7f',
					'mint': '#98fb98',
					'neon': '#39ff14'
				}
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
				'gradient-x': {
					'0%, 100%': {
						'background-position': '0% 50%'
					},
					'50%': {
						'background-position': '100% 50%'
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
				'glow': {
					'0%, 100%': {
						'box-shadow': '0 0 20px #00ff41, 0 0 30px #00ff41, 0 0 40px #00ff41'
					},
					'50%': {
						'box-shadow': '0 0 30px #00ff41, 0 0 40px #00ff41, 0 0 50px #00ff41'
					}
				},
				'text-glow': {
					'0%, 100%': {
						'text-shadow': '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41'
					},
					'50%': {
						'text-shadow': '0 0 20px #00ff41, 0 0 30px #00ff41, 0 0 40px #00ff41'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'gradient-x': 'gradient-x 15s ease infinite',
				'fade-in': 'fade-in 0.5s ease-out',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'text-glow': 'text-glow 2s ease-in-out infinite alternate'
			},
			boxShadow: {
				'green-glow': '0 0 20px rgba(0, 255, 65, 0.5)',
				'green-glow-lg': '0 0 40px rgba(0, 255, 65, 0.6)',
				'green-glow-xl': '0 0 60px rgba(0, 255, 65, 0.7)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
