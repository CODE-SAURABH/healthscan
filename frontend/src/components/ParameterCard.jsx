import React, { useState } from 'react'
import './ParameterCard.css'

const SEVERITY_STYLES = {
    green: { dot: '🟢', barClass: 'bar-green' },
    yellow: { dot: '🟡', barClass: 'bar-yellow' },
    red: { dot: '🔴', barClass: 'bar-red' },
}

function ParameterCard({ param, language, index }) {
    const [expanded, setExpanded] = useState(param.severity !== 'green')

    const style = SEVERITY_STYLES[param.severity] || SEVERITY_STYLES.green
    const explanation = language === 'hi' ? param.explanation_hi : param.explanation_en

    // Calculate where the value falls in the range for the visual bar
    const getBarPosition = () => {
        if (!param.ref_low && !param.ref_high) return 50
        const low = param.ref_low || 0
        const high = param.ref_high || low * 2
        const range = high - low
        if (range === 0) return 50
        const position = ((param.value - low) / range) * 100
        return Math.max(0, Math.min(100, position))
    }

    return (
        <div
            className={`param-card ${expanded ? 'expanded' : ''}`}
            onClick={() => setExpanded(!expanded)}
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            {/* Header Row */}
            <div className="param-header">
                <div className="param-left">
                    <span className="param-dot">{style.dot}</span>
                    <div className="param-names">
                        <span className="param-name">{param.test_name_simple || param.test_name}</span>
                        {param.test_name_simple && param.test_name !== param.test_name_simple && (
                            <span className="param-medical-name">{param.test_name}</span>
                        )}
                    </div>
                </div>
                <div className="param-right">
                    <div className="param-value-group">
                        <span className={`param-value ${param.severity}`}>{param.value}</span>
                        <span className="param-unit">{param.unit}</span>
                    </div>
                    <svg className={`chevron ${expanded ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="param-details">
                    {/* Range Bar */}
                    <div className="range-visual">
                        <div className="range-bar">
                            <div className="range-normal"></div>
                            <div
                                className={`range-marker ${style.barClass}`}
                                style={{ left: `${getBarPosition()}%` }}
                            >
                                <span className="marker-value">{param.value}</span>
                            </div>
                        </div>
                        <div className="range-labels">
                            <span>{param.ref_low || '—'}</span>
                            <span className="range-info">Normal Range</span>
                            <span>{param.ref_high || '—'}</span>
                        </div>
                    </div>

                    {/* Explanation */}
                    <p className="param-explanation">{explanation}</p>
                </div>
            )}
        </div>
    )
}

export default ParameterCard
