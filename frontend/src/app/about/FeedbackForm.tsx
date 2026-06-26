"use client";

import React, { useState } from 'react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import emailjs from '@emailjs/browser';

export default function FeedbackForm() {
  const { t } = useLanguage();
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
      await emailjs.send(
        "service_qswhwkv",
        "template_96zrlpe",
        {
          from_name: name,
          contact_details: contact,
          message: message,
          to_email: "shabhishek055@gmail.com"
        },
        "rVSV-xM9276MY7MP_"
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
    <div className="glass-panel p-6 sm:p-8 md:p-10 rounded-3xl h-full flex flex-col justify-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-cream mb-4 sm:mb-6 flex items-center gap-3">
        <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-saffron" /> {t('about.submit_feedback')}
      </h2>

      {status === "success" && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 text-sm font-semibold">
          Your feedback has been sent directly to shabhishek055@gmail.com. Thank you!
        </div>
      )}
      {status === "error" && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm font-semibold">
          Failed to send feedback. Please try again.
        </div>
      )}

      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-bold text-cream/70 uppercase tracking-widest">{t('about.name_label')}</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={sending}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-saffron/20 text-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron/50 transition-all font-medium placeholder:text-cream/30 disabled:opacity-50 text-sm sm:text-base"
            placeholder={t('about.name_placeholder')}
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-bold text-cream/70 uppercase tracking-widest">{t('about.contact_label')}</label>
          <input
            type="text"
            required
            value={contact}
            onChange={e => setContact(e.target.value)}
            disabled={sending}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-saffron/20 text-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron/50 transition-all font-medium placeholder:text-cream/30 disabled:opacity-50 text-sm sm:text-base"
            placeholder={t('about.contact_placeholder')}
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-bold text-cream/70 uppercase tracking-widest">{t('about.message_label')}</label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={sending}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-saffron/20 text-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron/50 transition-all font-medium resize-none placeholder:text-cream/30 disabled:opacity-50 text-sm sm:text-base"
            placeholder={t('about.message_placeholder')}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full py-3 sm:py-4 bg-saffron text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 text-sm sm:text-base"
        >
          {sending ? t('about.sending') : t('about.send')}
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
