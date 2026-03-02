import React from 'react'
import './MedicineSavings.css'

const TEXT = {
    en: {
        title: '💰 Potential Savings',
        subtitle: 'By switching to Generic (Jan Aushadhi) alternatives',
        original: 'Original Med',
        generic: 'Generic Salt',
        price: 'Price',
        save: 'Save',
        total: 'Total Potential Savings',
        note: 'Consult your doctor before switching medicines.'
    },
    hi: {
        title: '💰 बचत की संभावना',
        subtitle: 'जेनेरिक (जन औषधि) विकल्पों को अपनाकर',
        original: 'ब्रांडेड दवा',
        generic: 'जेनेरिक साल्ट',
        price: 'कीमत',
        save: 'बचत',
        total: 'कुल संभावित बचत',
        note: 'दवा बदलने से पहले अपने डॉक्टर से सलाह लें।'
    }
}

function MedicineSavings({ savings, language }) {
    if (!savings || !savings.alternatives || savings.alternatives.length === 0) return null
    const t = TEXT[language] || TEXT.en

    return (
        <div className="medicine-savings-card">
            <div className="savings-header">
                <h3>{t.title}</h3>
                <p>{t.subtitle}</p>
            </div>

            <div className="alternatives-list">
                {savings.alternatives.map((alt, idx) => (
                    <div key={idx} className="alt-item">
                        <div className="alt-info">
                            <span className="alt-original">{alt.original}</span>
                            <span className="alt-generic">➡️ {alt.generic_name}</span>
                            {alt.purpose && <span className="alt-purpose">{alt.purpose}</span>}
                        </div>
                        <div className="alt-price">
                            <span className="price-tag old">₹{alt.branded_price}</span>
                            <span className="price-tag new">₹{alt.generic_price}</span>
                            <span className="savings-badge">-{alt.percentage}%</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="savings-footer">
                <div className="total-savings">
                    <span>{t.total}:</span>
                    <span className="highlight">₹{savings.total_potential_savings}</span>
                </div>
                <p className="disclaimer-note">⚠️ {t.note}</p>
            </div>
        </div>
    )
}

export default MedicineSavings
