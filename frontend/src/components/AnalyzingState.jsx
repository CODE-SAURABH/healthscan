import React from 'react'
import './AnalyzingState.css'

const TEXT = {
    en: {
        title: 'Analyzing your report...',
        subtitle: 'Our AI is reading every value carefully',
        step1: 'Uploading report',
        step2: 'Reading test values',
        step3: 'Generating explanations',
        step4: 'Preparing your summary',
        note: '⏱️ Usually takes 15-30 seconds',
    },
    hi: {
        title: 'आपकी रिपोर्ट का विश्लेषण हो रहा है...',
        subtitle: 'हमारा AI हर वैल्यू को ध्यान से पढ़ रहा है',
        step1: 'रिपोर्ट अपलोड हो रही है',
        step2: 'टेस्ट वैल्यू पढ़ी जा रही हैं',
        step3: 'स्पष्टीकरण तैयार हो रहे हैं',
        step4: 'आपका सारांश तैयार हो रहा है',
        note: '⏱️ आमतौर पर 15-30 सेकंड लगते हैं',
    },
}

function AnalyzingState({ language }) {
    const t = TEXT[language] || TEXT.en

    return (
        <div className="analyzing-container">
            <div className="analyzing-card">
                {/* Animated Scanner */}
                <div className="scanner-visual">
                    <div className="scanner-ring ring-1"></div>
                    <div className="scanner-ring ring-2"></div>
                    <div className="scanner-ring ring-3"></div>
                    <div className="scanner-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                </div>

                <h2 className="analyzing-title">{t.title}</h2>
                <p className="analyzing-subtitle">{t.subtitle}</p>

                {/* Progress Steps */}
                <div className="progress-steps">
                    <div className="step active">
                        <div className="step-dot done"></div>
                        <span>{t.step1}</span>
                    </div>
                    <div className="step active">
                        <div className="step-dot loading"></div>
                        <span>{t.step2}</span>
                    </div>
                    <div className="step">
                        <div className="step-dot"></div>
                        <span>{t.step3}</span>
                    </div>
                    <div className="step">
                        <div className="step-dot"></div>
                        <span>{t.step4}</span>
                    </div>
                </div>

                <p className="analyzing-note">{t.note}</p>
            </div>
        </div>
    )
}

export default AnalyzingState
