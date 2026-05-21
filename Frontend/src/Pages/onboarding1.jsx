import React from 'react';
import './onboarding1.css';
import Button from '../components/button';

export default function Onboarding1() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
            <div className="loading-circle-wrapper">
                <svg className="loading-circle" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" />
                </svg>
                <h1 className="diary-title">
                    Dear Diary
                    <span className="dots">
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                    </span>
                </h1>
            </div>

            <Button />
        </div>
    )
}
