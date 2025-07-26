import React from 'react'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "Is my data secure?",
        answer: "Yes, your data is encrypted and only accessible to you. We use industry-standard security practices.",
    },
    {
        question: "Where is my data stored?",
        answer: "All data is securely stored in the cloud, using trusted providers with strong privacy controls.",
    },
    {
        question: "Does OpenAI use my recordings to train their AI models?",
        answer: "No, your recordings are not shared with OpenAI or used to train their models. Your privacy is our priority.",
    },
    {
        question: "Can I export my data?",
        answer: "Yes, you can export your data as a PDF with all transcripts, summaries, and tags.",
    },
    {
        question: "Is there a lifetime option instead of a subscription?",
        answer: "Currently, we offer monthly and yearly subscriptions. Lifetime options may be considered in the future.",
    },
    {
        question: "Who besides me can access my data?",
        answer: "Only you can access your data. No one else, including our team, can view your private entries.",
    },
    {
        question: "How do I permanently delete my data?",
        answer: "You can delete your account and all associated data from the account management section.",
    },
    {
        question: "What's included in the paid plan?",
        answer: "The paid plan unlocks unlimited entries, advanced analytics, and priority support.",
    },
    {
        question: "Will my entries be used for ads or marketing?",
        answer: "Never. Your entries are private and will not be used for advertising or marketing purposes.",
    },
    {
        question: "Can I disable the AI features?",
        answer: "Yes, you can toggle AI features in your settings.",
    },
    {
        question: "What is the company and where are they based?",
        answer: "This is a personal project by [Your Name], built with love and privacy in mind.",
    },
];

const FAQ = () => {
    return (
        <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, idx) => (
                    <AccordionItem
                        value={`faq-${idx}`}
                        key={faq.question}
                        className="bg-muted/50 rounded-xl border border-border/40 shadow p-4"
                    >
                        <AccordionTrigger className="text-left text-base font-medium">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};


export default FAQ;
