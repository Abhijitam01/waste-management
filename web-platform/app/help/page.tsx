'use client';

import { motion } from 'framer-motion';
import { Upload, MapPin, Wind, BarChart3, CheckCircle2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function HelpPage() {
  const router = useRouter();

  const steps = [
    {
      icon: Upload,
      title: 'Report Waste',
      description: 'Take a photo of ocean waste or upload an existing image. Our AI will automatically classify the type of waste.',
      tips: ['Enable location services for accurate tracking', 'Take clear, well-lit photos', 'Multiple angles help improve accuracy'],
    },
    {
      icon: CheckCircle2,
      title: 'AI Classification',
      description: 'Our machine learning model identifies the waste type (plastic, glass, metal, paper, cardboard, or trash) with confidence scores.',
      tips: ['Confidence above 80% is considered reliable', 'Review the top 3 predictions', 'Report is saved automatically'],
    },
    {
      icon: MapPin,
      title: 'View on Map',
      description: 'All reports appear on the interactive map, sorted by distance from your location. Click markers to see details.',
      tips: ['Use the map to find nearby waste', 'Filter by waste type', 'Check the "Nearby Waste" list for quick access'],
    },
    {
      icon: Wind,
      title: 'Drift Analysis',
      description: 'Enable drift analysis to see where waste will move based on wind and ocean currents over 24-72 hours.',
      tips: ['Toggle drift on/off from the dashboard', 'Blue arrows show predicted movement', 'Click arrows for detailed predictions'],
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Monitor cleanup statistics, view trends, and coordinate with other NGOs for maximum impact.',
      tips: ['Check dashboard stats regularly', 'Focus on high-confidence reports', 'Prioritize nearby locations'],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        userEmail={auth.currentUser?.email || undefined}
        onLogout={async () => {
          await auth.signOut();
          router.push('/');
        }}
      />

      <div className="flex-1 lg:ml-72 p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-foreground mb-3">How to Use OceanCleanup Connect</h1>
          <p className="text-muted-foreground text-lg mb-12">
            A step-by-step guide to reporting waste, viewing data, and coordinating cleanup efforts.
          </p>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-primary">Step {index + 1}</span>
                      <h3 className="text-xl font-bold text-card-foreground">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-card-foreground">Tips:</p>
                      <ul className="space-y-1">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 bg-primary text-primary-foreground rounded-lg"
          >
            <h3 className="text-xl font-bold mb-2">Need More Help?</h3>
            <p className="text-primary-foreground/80 mb-4">
              If you have questions or need assistance, please contact our support team or check the FAQ section.
            </p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-background text-foreground rounded-lg hover:bg-accent transition-colors">
                Contact Support
              </button>
              <button className="px-4 py-2 bg-background/20 text-primary-foreground rounded-lg hover:bg-background/30 transition-colors">
                View FAQ
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
