import React, { useState, useEffect } from 'react'
import config from './config'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import AnalyzingState from './components/AnalyzingState'
import ResultsView from './components/ResultsView'
import Disclaimer from './components/Disclaimer'
import './App.css'

function App() {
    const [state, setState] = useState('idle') // idle, uploading, analyzing, results, error
    const [results, setResults] = useState(null)
    const [error, setError] = useState(null)
    const [language, setLanguage] = useState(config.DEFAULT_LANGUAGE)
    const [theme, setTheme] = useState(config.DEFAULT_THEME)

    // Apply theme to HTML element
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    const handleUpload = async (file) => {
        setState('uploading')
        setError(null)

        const formData = new FormData()
        formData.append('file', file)

        try {
            setState('analyzing')

            const response = await fetch(`${config.API_URL}/api/analyze`, {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok || data.error) {
                throw new Error(data.message || data.detail || 'Analysis failed')
            }

            setResults(data)
            setState('results')
        } catch (err) {
            console.error('Upload failed:', err)
            setError(
                language === 'hi'
                    ? 'कुछ गलत हो गया। कृपया दोबारा कोशिश करें।'
                    : err.message || 'Something went wrong. Please try again.'
            )
            setState('error')
        }
    }

    const handleReset = () => {
        setState('idle')
        setResults(null)
        setError(null)
    }

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'hi' : 'en')
    }

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }

    return (
        <div className="app">
            <Header
                language={language}
                theme={theme}
                onToggleLanguage={toggleLanguage}
                onToggleTheme={toggleTheme}
            />

            <main className="main-content">
                {(state === 'idle' || state === 'error') && (
                    <UploadSection onUpload={handleUpload} error={error} language={language} />
                )}

                {(state === 'uploading' || state === 'analyzing') && (
                    <AnalyzingState language={language} />
                )}

                {state === 'results' && results && (
                    <ResultsView
                        results={results}
                        language={language}
                        onReset={handleReset}
                    />
                )}
            </main>

            <Disclaimer language={language} />
        </div>
    )
}

export default App
