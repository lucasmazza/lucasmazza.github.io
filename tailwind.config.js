module.exports = {
  content: ['./layouts/**/*.html', './content/**/*.{html,md}'],
  theme: {
    extend: {
      keyframes: {
        wave: {
          '0%': { transform: 'rotate(0.0deg)' },
          '10%': { transform: 'rotate(14deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '30%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(10.0deg)' },
          '60%': { transform: 'rotate(0.0deg)' },
          '100%': { transform: 'rotate(0.0deg)' },
        },
      },
      animation: {
        'waving-hand': 'wave 1.5s linear 5s infinite',
      },
      boxShadow: {
        'r-drop': '20px 0 12px -2px rgba(0, 0, 0, .1)'
      }
    },
  },
  plugins: [],
}