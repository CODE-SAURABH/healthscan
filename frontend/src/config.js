/**
 * HealthScan — Frontend Configuration
 * 
 * All settings are configurable via environment variables (VITE_ prefix).
 * In production, set these in Vercel/Netlify dashboard.
 */

const config = {
    // Backend API URL — change this to your deployed backend
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',

    // App name
    APP_NAME: import.meta.env.VITE_APP_NAME || 'HealthScan',

    // Default language: 'en' or 'hi'
    DEFAULT_LANGUAGE: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en',

    // Default theme: 'dark' or 'light'
    DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'dark',

    // Max file upload size in MB
    MAX_FILE_SIZE_MB: 10,

    // Supported file types
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    ALLOWED_EXTENSIONS: '.jpg,.jpeg,.png,.webp,.pdf',

    // Medical disclaimer
    DISCLAIMER: {
        en: 'This analysis is for informational purposes only and is NOT medical advice. Always consult a qualified healthcare professional for diagnosis and treatment decisions.',
        hi: 'यह विश्लेषण केवल जानकारी के उद्देश्य से है और यह चिकित्सा सलाह नहीं है। निदान और उपचार के निर्णयों के लिए हमेशा योग्य स्वास्थ्य पेशेवर से परामर्श करें।',
    },
}

export default config
