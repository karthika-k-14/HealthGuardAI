import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ShieldPlus,
  Mail,
  MapPin,
  Phone,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';
import { PATHS } from '../../../constants/routes';

const QUICK_LINKS = [
  { label: 'Home', href: '#overview' },
  { label: 'Features', href: '#features' },
  { label: 'AI Assistant', href: '#ai-assistant' },
  { label: 'Disease Awareness', href: '#disease-awareness' },
];

const RESOURCES = [
  { label: 'FAQ', href: '#faq' },
  { label: 'Testimonials', href: '#faq' },
  { label: 'Sign in', to: PATHS.LOGIN },
];

const GOVERNMENT_LINKS = [
  { label: 'Ministry of Health & Family Welfare', href: 'https://www.mohfw.gov.in' },
  { label: 'National Health Mission', href: 'https://nhm.gov.in' },
  { label: 'Ayushman Bharat', href: 'https://ab-hwc.nhp.gov.in' },
];

const SOCIALS = [
  { label: 'Facebook', icon: Facebook, href: '#' },
  { label: 'Twitter', icon: Twitter, href: '#' },
  { label: 'Instagram', icon: Instagram, href: '#' },
  { label: 'LinkedIn', icon: Linkedin, href: '#' },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('Subscribed! You\u2019ll get health alerts in your inbox.');
    setEmail('');
  };

  return (
    <footer id="footer-contact" className="mt-24 border-t border-slate-200/70 bg-white/60 dark:border-white/10 dark:bg-transparent">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr_1.1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600">
                <ShieldPlus className="h-4.5 w-4.5 text-white" aria-hidden="true" />
              </span>
              <span className="font-display text-base font-semibold text-slate-900 dark:text-white">
                HealthGuard AI
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-600 dark:text-slate-400">
              An AI-driven public health awareness and early-response platform for
              citizens, ASHA workers, pharmacists, and health officers.
            </p>
            <div className="mt-4 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-brand-500 hover:text-white dark:bg-white/10 dark:text-slate-300"
                >
                  <s.icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Quick Links</p>
            <ul className="mt-3 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Resources</p>
            <ul className="mt-3 space-y-2.5">
              {RESOURCES.map((link) => (
                <li key={link.label}>
                  {link.to ? (
                    <Link to={link.to} className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Government Links</p>
            <ul className="mt-3 space-y-2.5">
              {GOVERNMENT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Contact</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> support@healthguard.in
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> +91 1800 111 222
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> Coimbatore, Tamil Nadu, India
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-900 dark:text-white">Newsletter</p>
            <form onSubmit={handleSubscribe} className="mt-2.5 flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="input-field flex-1 py-2 text-sm"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-500 dark:border-white/10 dark:text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} HealthGuard AI. All rights reserved.</p>
          <p>Built for public health awareness, response, and coordination.</p>
        </div>
      </div>
    </footer>
  );
}
