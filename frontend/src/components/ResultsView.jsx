import React from 'react'
import config from '../config'
import ParameterCard from './ParameterCard'
import MedicineSavings from './MedicineSavings'
import './ResultsView.css'

const SEVERITY_CONFIG = {
    green: {
        label: { en: 'Healthy', hi: 'स्वस्थ' },
        emoji: '✅',
        class: 'severity-green',
    },
    yellow: {
        label: { en: 'Needs Attention', hi: 'ध्यान देने योग्य' },
        emoji: '⚠️',
        class: 'severity-yellow',
    },
    red: {
        label: { en: 'Consult Doctor', hi: 'डॉक्टर से मिलें' },
        emoji: '🔴',
        class: 'severity-red',
    },
}

const TEXT = {
    en: {
        normal: 'Normal',
        watch: 'Watch',
        critical: 'Critical',
        concerns_title: '⚠️ Points to Discuss with Your Doctor:',
        positive_title: '✅ Good News:',
        red_section: '🔴 Needs Attention',
        yellow_section: '🟡 Worth Monitoring',
        green_section: '🟢 Normal',
        scan_another: 'Scan Another Report',
        download_pdf: 'Download PDF Summary',
        default_disclaimer: 'This is NOT medical advice. Always consult a qualified healthcare professional.',
    },
    hi: {
        normal: 'सामान्य',
        watch: 'ध्यान दें',
        critical: 'गंभीर',
        concerns_title: '⚠️ डॉक्टर से चर्चा करने योग्य बातें:',
        positive_title: '✅ अच्छी ख़बर:',
        red_section: '🔴 ध्यान देने योग्य',
        yellow_section: '🟡 निगरानी योग्य',
        green_section: '🟢 सामान्य',
        scan_another: 'एक और रिपोर्ट स्कैन करें',
        download_pdf: 'पीडीएफ सारांश डाउनलोड करें',
        default_disclaimer: 'यह चिकित्सा सलाह नहीं है। हमेशा योग्य स्वास्थ्य पेशेवर से परामर्श करें।',
    },
}

function ResultsView({ results, language, onReset }) {
    const { report_id, parameters = [], summary = {}, report_info = {}, disclaimer } = results
    const severity = SEVERITY_CONFIG[summary.overall_severity] || SEVERITY_CONFIG.green
    const t = TEXT[language] || TEXT.en

    const handleDownloadPDF = () => {
        // Navigate to the backend PDF endpoint
        const url = `${config.API_URL}/api/report/${report_id}/pdf?lang=${language}`
        window.open(url, '_blank')
    }

    const summaryText = language === 'hi' ? summary.summary_hi : summary.summary_en

    // Separate parameters by severity
    const redParams = parameters.filter(p => p.severity === 'red')
    const yellowParams = parameters.filter(p => p.severity === 'yellow')
    const greenParams = parameters.filter(p => p.severity === 'green')

    return (
        <div className="results-view">
            {/* Overall Summary Card */}
            <div className={`summary-card ${severity.class}`} id="summary-card">
                <div className="summary-header">
                    <div className="summary-icon">{severity.emoji}</div>
                    <div className="summary-title-group">
                        <h2 className="summary-title">{severity.label[language] || severity.label.en}</h2>
                        {report_info.report_type && (
                            <span className="summary-type">{report_info.report_type}</span>
                        )}
                    </div>
                </div>

                <p className="summary-text">{summaryText}</p>
                <MedicineSavings savings={results.savings} language={language} />

                {/* Stats */}
                <div className="summary-stats">
                    <div className="stat stat-green">
                        <span className="stat-value">{summary.values_normal || 0}</span>
                        <span className="stat-label">{t.normal}</span>
                    </div>
                    <div className="stat stat-yellow">
                        <span className="stat-value">{summary.values_attention || 0}</span>
                        <span className="stat-label">{t.watch}</span>
                    </div>
                    <div className="stat stat-red">
                        <span className="stat-value">{summary.values_critical || 0}</span>
                        <span className="stat-label">{t.critical}</span>
                    </div>
                </div>

                {/* Key Concerns */}
                {summary.key_concerns && summary.key_concerns.length > 0 && (
                    <div className="concerns-list">
                        <h4 className="concerns-title">{t.concerns_title}</h4>
                        {summary.key_concerns.map((concern, idx) => (
                            <div key={idx} className="concern-item">• {concern}</div>
                        ))}
                    </div>
                )}

                {/* Positive Notes */}
                {summary.positive_notes && summary.positive_notes.length > 0 && (
                    <div className="positive-list">
                        <h4 className="positive-title">{t.positive_title}</h4>
                        {summary.positive_notes.map((note, idx) => (
                            <div key={idx} className="positive-item">• {note}</div>
                        ))}
                    </div>
                )}
            </div>

            {/* Report Info */}
            {(report_info.lab_name || report_info.report_date || report_info.patient_name) && (
                <div className="report-meta">
                    {report_info.patient_name && <span>👤 {report_info.patient_name}</span>}
                    {report_info.lab_name && <span>🏥 {report_info.lab_name}</span>}
                    {report_info.report_date && <span>📅 {report_info.report_date}</span>}
                </div>
            )}

            {/* Parameters by severity */}
            {redParams.length > 0 && (
                <div className="param-section">
                    <h3 className="param-section-title red-title">
                        {t.red_section} ({redParams.length})
                    </h3>
                    <div className="param-grid">
                        {redParams.map((param, idx) => (
                            <ParameterCard key={idx} param={param} language={language} index={idx} />
                        ))}
                    </div>
                </div>
            )}

            {yellowParams.length > 0 && (
                <div className="param-section">
                    <h3 className="param-section-title yellow-title">
                        {t.yellow_section} ({yellowParams.length})
                    </h3>
                    <div className="param-grid">
                        {yellowParams.map((param, idx) => (
                            <ParameterCard key={idx} param={param} language={language} index={idx} />
                        ))}
                    </div>
                </div>
            )}

            {greenParams.length > 0 && (
                <div className="param-section">
                    <h3 className="param-section-title green-title">
                        {t.green_section} ({greenParams.length})
                    </h3>
                    <div className="param-grid">
                        {greenParams.map((param, idx) => (
                            <ParameterCard key={idx} param={param} language={language} index={idx} />
                        ))}
                    </div>
                </div>
            )}

            {/* Disclaimer */}
            <div className="results-disclaimer">
                <p>⚠️ {disclaimer || t.default_disclaimer}</p>
            </div>

            {/* Actions */}
            <div className="results-actions">
                <button className="btn-primary" onClick={handleDownloadPDF} id="download-pdf-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {t.download_pdf}
                </button>
                <button className="btn-secondary" onClick={onReset} id="scan-another-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    {t.scan_another}
                </button>
            </div>
        </div>
    )
}

export default ResultsView
