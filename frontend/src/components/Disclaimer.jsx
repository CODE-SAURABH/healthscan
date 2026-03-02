import React from 'react'
import config from '../config'
import './Disclaimer.css'

const TEXT = {
    en: {
        label: 'Medical Disclaimer:',
        text: 'HealthScan provides informational analysis only. It does NOT provide medical advice, diagnosis, or treatment recommendations. Always consult a qualified healthcare professional for medical decisions.',
        copy: `© 2026 ${config.APP_NAME} • Built to make healthcare accessible`,
    },
    hi: {
        label: 'चिकित्सा अस्वीकरण:',
        text: 'HealthScan केवल सूचनात्मक विश्लेषण प्रदान करता है। यह चिकित्सा सलाह, निदान या उपचार की सिफारिश प्रदान नहीं करता। चिकित्सा निर्णयों के लिए हमेशा योग्य स्वास्थ्य पेशेवर से परामर्श करें।',
        copy: `© 2026 ${config.APP_NAME} • स्वास्थ्य सेवा को सुलभ बनाने के लिए निर्मित`,
    },
}

function Disclaimer({ language }) {
    const t = TEXT[language] || TEXT.en

    return (
        <footer className="disclaimer-footer">
            <div className="disclaimer-inner">
                <p className="disclaimer-text">
                    ⚕️ <strong>{t.label}</strong> {t.text}
                </p>
                <p className="disclaimer-copy">{t.copy}</p>
            </div>
        </footer>
    )
}

export default Disclaimer
