import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell, Sparkles, Zap, Shield, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.15),transparent_50%)]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Powered by Google Gemini AI
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent"
          >
            GODLIKE <br /> PHYSIQUE AI
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-12"
          >
            The ultimate AI training partner. Scan your equipment, define your goals, and let our neural networks forge your path to perfection.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <Link to="/auth">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-8 text-xl font-bold rounded-2xl shadow-2xl shadow-orange-500/20 group">
                Start Your Ascension
                <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Vision Detection",
              desc: "Upload a photo of your gym. Our AI identifies every piece of equipment instantly."
            },
            {
              icon: Dumbbell,
              title: "Neural Coaching",
              desc: "Custom workouts generated based on biomechanics and your specific equipment."
            },
            {
              icon: Shield,
              title: "Progress Tracking",
              desc: "Log every set, rep, and rest period. Watch your evolution in real-time."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-orange-500/30 transition-colors"
            >
              <div className="bg-orange-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;