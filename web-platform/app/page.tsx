'use client';

import { motion } from 'framer-motion';
import { Waves, MapPin, TrendingUp, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
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

            <h1 className="text-6xl md:text-8xl font-bold mb-6 text-foreground">
              OceanCleanup
              <br />
              Connect
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Empowering NGOs to identify, track, and coordinate ocean waste cleanup operations with AI-powered detection and real-time drift analysis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <motion.button
                  className="group px-8 py-4 bg-primary rounded-lg font-semibold text-primary-foreground flex items-center gap-2 hover:opacity-90 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

              <Link href="/report">
                <motion.button
                  className="px-8 py-4 bg-background border-2 border-primary rounded-lg font-semibold text-foreground hover:bg-accent transition-all"
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
    </div>
  );
}
