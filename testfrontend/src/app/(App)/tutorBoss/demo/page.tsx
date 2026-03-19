'use client';
import BossBattle from '../BossBattle';
import { useRouter } from 'next/navigation';

const DEMO_QUESTIONS = [
    {
        question: 'What does HTML stand for?',
        optionA: 'Hyperlinks and Text Markup Language',
        optionB: 'HyperText Markup Language',
        optionC: 'Home Tool Markup Language',
        optionD: 'Hyper Transfer Markup Language',
        correctAnswer: 'B' as const,
    },
    {
        question: 'Which tag creates a hyperlink?',
        optionA: '<link>',
        optionB: '<url>',
        optionC: '<a>',
        optionD: '<href>',
        correctAnswer: 'C' as const,
    },
    {
        question: 'What CSS property changes text color?',
        optionA: 'text-color',
        optionB: 'font-color',
        optionC: 'foreground-color',
        optionD: 'color',
        correctAnswer: 'D' as const,
    },
    {
        question: 'Which property controls space outside an element?',
        optionA: 'padding',
        optionB: 'spacing',
        optionC: 'margin',
        optionD: 'border',
        correctAnswer: 'C' as const,
    },
    {
        question: 'What does DOM stand for?',
        optionA: 'Document Object Model',
        optionB: 'Data Output Manager',
        optionC: 'Dynamic Object Module',
        optionD: 'Document Order Map',
        correctAnswer: 'A' as const,
    },
    {
        question: 'Which JavaScript method selects an element by ID?',
        optionA: 'document.getElement()',
        optionB: 'document.querySelector()',
        optionC: 'document.findById()',
        optionD: 'document.getElementById()',
        correctAnswer: 'D' as const,
    },
    {
        question: 'What does CSS stand for?',
        optionA: 'Creative Style Sheets',
        optionB: 'Cascading Style Sheets',
        optionC: 'Computer Style Syntax',
        optionD: 'Coded Style System',
        correctAnswer: 'B' as const,
    },
];

export default function BattleDemoPage() {
    const router = useRouter();

    return (
        <BossBattle
            lessonId={3}
            lessonTitle="JavaScript & The DOM"
            isFinalBoss={true}
            questions={DEMO_QUESTIONS}
            onVictory={(score) => {
                console.log('Victory! Score:', score);
                // router.push('/course/1');
            }}
            onDefeat={() => {
                console.log('Defeated!');
            }}
            onExit={() => router.back()}
        />
    );
}