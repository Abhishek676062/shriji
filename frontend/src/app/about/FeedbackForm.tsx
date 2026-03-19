"use client";

import React, { useState } from 'react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function FeedbackForm() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !message) return;

    setSending(true);
    setStatus("idle");

    try {
      // NOTE: User must replace these with their actual EmailJS credentials
      // from https://dashboard.emailjs.com/
      await emailjs.send(
        "service_qswhwkv", // Replace with EmailJS Service ID
        "template_96zrlpe", // Replace with EmailJS Template ID
        {
          from_name: name,
          contact_details: contact,
          message: message,
          to_email: "shabhishek055@gmail.com"
        },
        "rVSV-xM9276MY7MP_" // Replace with EmailJS Public Key
      );

      setStatus("success");
      setName('');
      setContact('');
      setMessage('');
    } catch (err) {
      console.error("EmailJS Send Error:", err);
      setStatus("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-panel p-8 md:p-10 rounded-3xl h-full flex flex-col justify-center">
      <h2 className="text-3xl font-bold text-cream mb-6 flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-saffron" /> Submit Feedback
      </h2>

      {status === "success" && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 text-sm font-semibold">
          Your feedback has been sent directly to shabhishek055@gmail.com. Thank you!
        </div>
      )}
      {status === "error" && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm font-semibold">
          Failed to send feedback. Please check your Email.js configuration credentials in the code.
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-cream/70 uppercase tracking-widest">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={sending}
            className="w-full px-4 py-3 bg-white/10 border border-saffron/20 text-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron/50 transition-all font-medium placeholder:text-cream/30 disabled:opacity-50"
            placeholder="Your Name..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-cream/70 uppercase tracking-widest">Contact Details (Email or Phone)</label>
          <input
            type="text"
            required
            value={contact}
            onChange={e => setContact(e.target.value)}
            disabled={sending}
            className="w-full px-4 py-3 bg-white/10 border border-saffron/20 text-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron/50 transition-all font-medium placeholder:text-cream/30 disabled:opacity-50"
            placeholder="Email or Phone Number..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-cream/70 uppercase tracking-widest">Your Message</label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={sending}
            className="w-full px-4 py-3 bg-white/10 border border-saffron/20 text-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron/50 transition-all font-medium resize-none placeholder:text-cream/30 disabled:opacity-50"
            placeholder="I loved how Shriji explained Chapter 2..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full py-4 bg-saffron text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {sending ? "Sending..." : "Send Message"}
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
