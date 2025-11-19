'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Waves, MapPin, TrendingUp, Users, ArrowRight, Camera } from 'lucide-react';
import Link from 'next/link';
import WasteDetectionModal from '@/components/WasteDetectionModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden border-b border-border">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <Waves className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by AI & Community</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-4 sm:mb-6 text-foreground">
              OceanCleanup
              <br />
              Connect
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Empowering NGOs to identify, track, and coordinate ocean waste cleanup operations with AI-powered detection and real-time drift analysis.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-primary rounded-lg font-semibold text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-all text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                Detect Waste Now
              </motion.button>

              <Link href="/dashboard" className="w-full sm:w-auto">
                <motion.button
                  className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-background border-2 border-primary rounded-lg font-semibold text-foreground hover:bg-accent transition-all text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Dashboard
                </motion.button>
              </Link>

              <Link href="/report" className="w-full sm:w-auto">
                <motion.button
                  className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-background border-2 border-primary rounded-lg font-semibold text-foreground hover:bg-accent transition-all text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Report Waste
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Intelligent Waste Management
          </h2>
          <p className="text-muted-foreground text-lg">
            Advanced features to make ocean cleanup more efficient
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: MapPin,
              title: 'Smart Proximity',
              description: 'Automatically shows waste locations closest to your NGO for efficient cleanup coordination.',
            },
            {
              icon: TrendingUp,
              title: 'Drift Analysis',
              description: 'Real-time wind and current data to predict waste movement and plan strategic interventions.',
            },
            {
              icon: Users,
              title: 'NGO Network',
              description: 'Connect with other organizations, share insights, and coordinate large-scale cleanup efforts.',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -8 }}
              className="group relative p-8 rounded-lg bg-card border border-border hover:border-primary transition-all"
            >
              <div className="inline-flex p-3 rounded-lg bg-primary mb-4">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-lg bg-primary text-primary-foreground"
        >
          <h2 className="text-4xl font-bold mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join NGOs worldwide in the fight against ocean pollution
          </p>
          <Link href="/login">
            <motion.button
              className="px-8 py-4 bg-background text-foreground rounded-lg font-semibold hover:bg-accent transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Waste Detection Modal */}
      <WasteDetectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Optionally redirect or show success message
          setTimeout(() => setIsModalOpen(false), 2000);
        }}
      />
    </div>
  );
}
