import React, { useState, useRef } from 'react';
import axios from 'axios';

const AzureSentimentAnalysis = () => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [sentiment, setSentiment] = useState(null);
    const [positiveScore, setPositiveScore] = useState(null);
    const [negativeScore, setNegativeScore] = useState(null);
    const [neutralScore, setNeutralScore] = useState(null);
    const [listening, setListening] = useState(false);
    let recognition = null;
    const fileInputRef = useRef(null);

    const analyzeSentiment = async () => {
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const fileContent = event.target.result;
                    const response = await axios.post(
                        'https://eastus.api.cognitive.microsoft.com/text/analytics/v3.0/sentiment',
                        {
                            documents: [
                                {
                                    id: '1',
                                    text: fileContent,
                                },
                            ],
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Ocp-Apim-Subscription-Key': '9f54ecd90376405587302221386854f8',
                            },
                        }
                    );
                    handleSentimentResponse(response.data.documents[0]);
                } catch (error) {
                    console.error('Error analyzing sentiment:', error);
                }
            };
            reader.readAsText(file);
        } else if (text.trim() !== '') {
            try {
                const response = await axios.post(
                    'https://eastus.api.cognitive.microsoft.com/text/analytics/v3.0/sentiment',
                    {
                        documents: [
                            {
                                id: '1',
                                text: text,
                            },
                        ],
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Ocp-Apim-Subscription-Key': '9f54ecd90376405587302221386854f8',
                        },
                    }
                );
                handleSentimentResponse(response.data.documents[0]);
            } catch (error) {
                console.error('Error analyzing sentiment:', error);
            }
        } else {
            console.error('No text or file uploaded.');
        }
    };

    const handleFileChange = (event) => {
        const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
    };

    const handleRemoveFile = () => {
        setFile(null);
        fileInputRef.current.value = null;
    };

    const handleSentimentResponse = (document) => {
        setSentiment(document.sentiment);
        const confidenceScores = document.confidenceScores;
        setPositiveScore(confidenceScores.positive);
        setNegativeScore(confidenceScores.negative);
        setNeutralScore(confidenceScores.neutral);
    };

    const getSentimentEmoji = (sentiment) => {
        if (sentiment === 'positive') {
            return '😊';
        } else if (sentiment === 'neutral') {
            return '😐';
        } else if (sentiment === 'negative') {
            return '😞';
        } else {
            return '';
        }
    };

    const getSentimentScorePercentage = (score) => {
        if (score) {
            return (score * 100).toFixed(2);
        }
        return '';
    };

    const handleVoiceInput = () => {
        recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setText(transcript);
        };
        recognition.start();
        setListening(true);
    };

    const clearText = () => {
        setText('');
    };

    return (
        <div>
            <h2>Azure Sentiment Analysis</h2>
            <div>
                <textarea
                    rows="4"
                    cols="50"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text for sentiment analysis..."
                ></textarea>
            </div>
            <div>
                <input type="file" onChange={handleFileChange} ref={fileInputRef} />
                {file && (
                    <button onClick={handleRemoveFile}>Remove File</button>
                )}
            </div>
            <br />
            <button onClick={analyzeSentiment}>Analyze Sentiment</button>
            <button onClick={handleVoiceInput}>Start Voice Input</button>
            <button onClick={clearText}>Clear Text</button>
            {sentiment && (
                <div>
                    <h3>Sentiment: {sentiment} {getSentimentEmoji(sentiment)}</h3>
                    <p>Positive Score: {getSentimentScorePercentage(positiveScore)}%</p>
                    <p>Negative Score: {getSentimentScorePercentage(negativeScore)}%</p>
                    <p>Neutral Score: {getSentimentScorePercentage(neutralScore)}%</p>
                </div>
            )}
        </div>
    );
};

export default AzureSentimentAnalysis;