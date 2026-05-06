import { motion } from 'framer-motion';
import { Shield, Hammer, ArrowRight, Activity, Zap } from 'lucide-react';

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-primary/30">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 md:py-24">
        {/* Header */}
        <header className="flex justify-between items-center mb-16 md:mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Nirṇay</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex gap-6 text-sm font-medium text-slate-300"
          >
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#portals" className="hover:text-white transition-colors">Portals</a>
          </motion.div>
        </header>

        {/* Hero Section */}
        <main className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Bidding Ecosystem
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
          >
            Transparent Decisions, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Secure Auctions.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl"
          >
            Nirṇay connects officers and bidders in a unified, real-time ecosystem. 
            Experience seamless auction management, secure bidding, and complete transparency.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            id="portals"
          >
            <a 
              href="http://localhost:5174" 
              className="group relative flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-slate-950 font-semibold hover:scale-105 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              <Hammer className="w-5 h-5" />
              Bidder Portal
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="http://localhost:5173" 
              className="group flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 font-semibold hover:bg-white/10 hover:scale-105 transition-all duration-300"
            >
              <Shield className="w-5 h-5" />
              Officer Portal
            </a>
          </motion.div>
        </main>

        {/* Features Section */}
        <section className="mt-32" id="features">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: <Activity className="w-6 h-6 text-primary" />,
                title: "Real-time Ecosystem",
                desc: "Live websocket connections ensure every bid and update is broadcasted instantly across all portals."
              },
              {
                icon: <Shield className="w-6 h-6 text-blue-400" />,
                title: "Secure & Verified",
                desc: "Role-based access control with Firebase Auth guarantees that only authorized users can participate or manage."
              },
              {
                icon: <Zap className="w-6 h-6 text-amber-400" />,
                title: "Fast Operations",
                desc: "Optimized for speed. Evaluate bids, review documents, and make decisions without any lag."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer hover:-translate-y-1 duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default App;
