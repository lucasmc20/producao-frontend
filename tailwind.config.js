/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'fabrica-verde': '#16a34a',
        'fabrica-azul': '#1e3a5f',
        'fabrica-azul-medio': '#2563eb',
        'fabrica-amarelo': '#ca8a04',
        'fabrica-vermelho': '#dc2626',
        'fabrica-cinza': '#6b7280',
        'fabrica-fundo': '#f1f5f9',
        'fabrica-superficie': '#ffffff',
      },
      fontSize: {
        'operador-sm': '1rem',
        'operador-base': '1.125rem',
        'operador-lg': '1.25rem',
        'operador-xl': '1.5rem',
      },
      minHeight: {
        'toque': '48px',
        'toque-lg': '64px',
      },
    },
  },
};
