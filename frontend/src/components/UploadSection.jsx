import React, { useState, useRef } from 'react'
import config from '../config'
import './UploadSection.css'

// Bilingual text
const TEXT = {
    en: {
        badge: 'AI-Powered Analysis',
        title_1: 'Understand your ',
        title_highlight: 'medical report',
        title_2: ' in seconds',
        subtitle: 'Upload your blood test report — our AI explains every value in simple language. No medical jargon. Just clear answers.',
        upload_cta: 'Click to upload or drag & drop',
        upload_drag: 'Drop your report here',
        upload_formats: 'Blood test reports • JPG, PNG, PDF • Max 10MB',
        chip_photo: '📸 Photo',
        chip_pdf: '📄 PDF',
        chip_scan: '🖼️ Scan',
        feat_1_title: 'Simple Language',
        feat_1_desc: 'No medical jargon. English + Hindi.',
        feat_2_title: 'Private & Secure',
        feat_2_desc: 'Your data stays private. Always.',
        feat_3_title: 'Instant Results',
        feat_3_desc: 'AI analysis in under 30 seconds.',
        try_again: 'Try Again',
        invalid_type: 'Please upload a JPG, PNG, WebP or PDF file.',
        file_too_large: 'File too large. Maximum size is 10MB.',
    },
    hi: {
        badge: 'AI-संचालित विश्लेषण',
        title_1: 'अपनी ',
        title_highlight: 'मेडिकल रिपोर्ट',
        title_2: ' सेकंडों में समझें',
        subtitle: 'अपनी ब्लड टेस्ट रिपोर्ट अपलोड करें — हमारा AI हर वैल्यू को सरल भाषा में समझाएगा। कोई मेडिकल शब्दजाल नहीं। बस स्पष्ट जवाब।',
        upload_cta: 'अपलोड करने के लिए क्लिक करें या ड्रैग करें',
        upload_drag: 'अपनी रिपोर्ट यहाँ छोड़ें',
        upload_formats: 'ब्लड टेस्ट रिपोर्ट • JPG, PNG, PDF • अधिकतम 10MB',
        chip_photo: '📸 फोटो',
        chip_pdf: '📄 PDF',
        chip_scan: '🖼️ स्कैन',
        feat_1_title: 'सरल भाषा',
        feat_1_desc: 'कोई मेडिकल शब्दजाल नहीं। हिंदी + अंग्रेज़ी।',
        feat_2_title: 'निजी एवं सुरक्षित',
        feat_2_desc: 'आपका डेटा हमेशा सुरक्षित रहता है।',
        feat_3_title: 'तुरंत परिणाम',
        feat_3_desc: '30 सेकंड से कम में AI विश्लेषण।',
        try_again: 'पुनः प्रयास करें',
        invalid_type: 'कृपया JPG, PNG, WebP या PDF फ़ाइल अपलोड करें।',
        file_too_large: 'फ़ाइल बहुत बड़ी है। अधिकतम आकार 10MB है।',
    },
}

function UploadSection({ onUpload, error, language }) {
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef(null)
    const t = TEXT[language] || TEXT.en

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFileSelect(file)
    }

    const handleFileSelect = (file) => {
        if (!config.ALLOWED_TYPES.includes(file.type)) {
            alert(t.invalid_type)
            return
        }
        if (file.size > config.MAX_FILE_SIZE_MB * 1024 * 1024) {
            alert(t.file_too_large)
            return
        }
        onUpload(file)
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleInputChange = (e) => {
        const file = e.target.files[0]
        if (file) handleFileSelect(file)
    }

    return (
        <section className="upload-section">
            {/* Hero */}
            <div className="hero">
                <div className="hero-badge">
                    <span className="badge-dot"></span>
                    {t.badge}
                </div>
                <h1 className="hero-title">
                    {t.title_1}<span className="gradient-text">{t.title_highlight}</span>{t.title_2}
                </h1>
                <p className="hero-subtitle">{t.subtitle}</p>
            </div>

            {/* Upload Zone */}
            <div
                className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                id="upload-zone"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={config.ALLOWED_EXTENSIONS}
                    onChange={handleInputChange}
                    className="file-input"
                    id="file-input"
                />

                <div className="upload-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </div>

                <div className="upload-text">
                    <span className="upload-primary">
                        {isDragging ? t.upload_drag : t.upload_cta}
                    </span>
                    <span className="upload-secondary">{t.upload_formats}</span>
                </div>

                <div className="upload-formats">
                    <span className="format-chip">{t.chip_photo}</span>
                    <span className="format-chip">{t.chip_pdf}</span>
                    <span className="format-chip">{t.chip_scan}</span>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="error-message" id="error-message">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <span>{error}</span>
                    <button className="error-retry" onClick={() => fileInputRef.current?.click()}>
                        {t.try_again}
                    </button>
                </div>
            )}

            {/* Features */}
            <div className="features">
                <div className="feature-card">
                    <div className="feature-icon">🟢</div>
                    <div className="feature-text">
                        <strong>{t.feat_1_title}</strong>
                        <span>{t.feat_1_desc}</span>
                    </div>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🔒</div>
                    <div className="feature-text">
                        <strong>{t.feat_2_title}</strong>
                        <span>{t.feat_2_desc}</span>
                    </div>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <div className="feature-text">
                        <strong>{t.feat_3_title}</strong>
                        <span>{t.feat_3_desc}</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default UploadSection
