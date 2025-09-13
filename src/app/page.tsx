"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Zap, TrendingUp, Lock, ArrowRight } from "lucide-react"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('username', data.username)
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
      }
    } catch (error) {
      console.error('Auth error:', error)
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by StarkNet & ChipiPay</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Invisible Yield<br />Your DeFi Autopilot.
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            The smartest yield farming protocol on StarkNet. 
            Connect with ChipiPay, deposit, and watch your portfolio grow automatically.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div 
              className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-gray-800"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">25% APY Average</h3>
              <p className="text-gray-400 text-sm">AI-optimized strategies across StarkNet DeFi</p>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-gray-800"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Zero Gas Fees</h3>
              <p className="text-gray-400 text-sm">StarkNet L2 = Ultra-low costs, maximum profits</p>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-gray-800"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">ChipiPay Secured</h3>
              <p className="text-gray-400 text-sm">Non-custodial with social recovery</p>
            </motion.div>
          </div>

          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition"
              />
              <motion.button
                onClick={handleGetStarted}
                disabled={!email || isLoading}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    Get Started <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No seed phrases. No gas fees. No complexity.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}