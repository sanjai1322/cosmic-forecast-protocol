
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
				// Space weather specific colors
				solar: {
					DEFAULT: '#ff9d00',
					active: '#ff5722',
					calm: '#ff9800'
				},
				cosmic: {
					DEFAULT: '#3d5afe',
					radiation: '#651fff',
					storm: '#d500f9'
				},
				space: {
					dark: '#0a0e17',
					deeper: '#060818',
					blue: '#1a2035'
				},
				alert: {
					low: '#4caf50',
					moderate: '#ff9800',
					high: '#f44336',
					severe: '#b71c1c'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'solar-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 15px 0px rgba(255, 157, 0, 0.4)'
					},
					'50%': { 
						boxShadow: '0 0 30px 10px rgba(255, 157, 0, 0.7)'
					}
				},
				'cosmic-glow': {
					'0%, 100%': { 
						textShadow: '0 0 10px rgba(61, 90, 254, 0.7)'
					},
					'50%': { 
						textShadow: '0 0 20px rgba(61, 90, 254, 1)'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'orbit': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'star-twinkle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.3' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'solar-pulse': 'solar-pulse 4s ease-in-out infinite',
				'cosmic-glow': 'cosmic-glow 3s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'orbit': 'orbit 60s linear infinite',
				'orbit-slow': 'orbit 120s linear infinite',
				'orbit-fast': 'orbit 30s linear infinite',
				'star-twinkle': 'star-twinkle 4s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
