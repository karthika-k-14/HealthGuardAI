import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { PATHS } from '../../constants/routes';

import Hero from './sections/Hero';
import StatsSection from './sections/StatsSection';
import FeaturesSection from './sections/FeaturesSection';
import ChatPreview from './sections/ChatPreview';
import DiseaseAwarenessSection from './sections/DiseaseAwarenessSection';
import CampaignCarousel from './sections/CampaignCarousel';
import HowItWorks from './sections/HowItWorks';
import TestimonialsSection from './sections/TestimonialsSection';
import FAQSection from './sections/FAQSection';

import React from 'react';

export default function Landing() {
  return (
    <div>
      <Hero />
      <StatsSection />
      <span id="hospitals" className="block" aria-hidden="true" />
      <FeaturesSection />
      <ChatPreview />
      <DiseaseAwarenessSection />
      <CampaignCarousel />
      <HowItWorks />
      <TestimonialsSection />
      <FAQSection />

      {/* Final CTA */}
      <section className="px-6 pb-24 pt-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-5xl flex-col items-center gap-5 rounded-xl3 bg-gradient-to-br from-brand-500 to-brand-700 px-8 py-14 text-center shadow-glow"
        >
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            Ready to strengthen your district's early response?
          </h2>
          <p className="max-w-lg text-sm text-brand-50/90">
            Sign in with your role-based account, or continue as a guest to explore.
          </p>
          <Link to={PATHS.LOGIN}>
            <Button variant="secondary" className="border-white/40 bg-white text-brand-700 hover:bg-brand-50">
              Get started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
