"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Zap, TrendingUp, Wallet, Send, ArrowUpRight, ArrowDownLeft, 
  Users, Trophy, Clock, DollarSign, Bitcoin
} from "lucide-react"

export default function Dashboard() {
  const [balance, setBalance] = useState(0.00124578)
  const [yieldEarned, setYieldEarned] = useState(0.00003421)
  const [apy] = useState(12.5)
  const [btcPrice] = useState(67432)

  useEffect(() => {
    const interval = setInterval(() => {
      setYieldEarned(prev => prev + 0.00000001)
      setBalance(prev => prev + 0.00000001)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const transactions = [
    { id: 1, type: "receive", amount: 0.0005, from: "@alice", time: "2 min ago" },
    { id: 2, type: "send", amount: 0.0002, to: "@bob", time: "1 hour ago" },
    { id: 3, type: "yield", amount: 0.00001, time: "3 hours ago" },
  ]

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">@{typeof window !== 'undefined' ? localStorage.getItem('username') || 'user' : 'user'}</span>
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div 
            className="lg:col-span-2 bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-transparent rounded-3xl p-8 border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-gray-400 mb-2">Total Balance</p>
                <h2 className="text-5xl font-bold mb-2">
                  {balance.toFixed(8)} BTC
                </h2>
                <p className="text-xl text-gray-400">
                  ${(balance * btcPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Bitcoin className="w-12 h-12 text-yellow-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-400">Today&apos;s Yield</span>
                </div>
                <p className="text-xl font-semibold">+{yieldEarned.toFixed(8)} BTC</p>
                <p className="text-sm text-green-500">+{apy}% APY</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-400">Next Payout</span>
                </div>
                <p className="text-xl font-semibold">2h 15m</p>
                <p className="text-sm text-gray-400">Automatic</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gray-900/50 rounded-3xl p-6 border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition">
                <Send className="w-5 h-5" />
                Send Money
              </button>
              <button className="w-full bg-gray-800 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-700 transition">
                <Wallet className="w-5 h-5" />
                Receive
              </button>
              <button className="w-full bg-gray-800 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-700 transition">
                <Zap className="w-5 h-5" />
                Lightning Pay
              </button>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div 
            className="bg-gray-900/50 rounded-3xl p-6 border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-black/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    {tx.type === "receive" ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-500" />
                    ) : tx.type === "send" ? (
                      <ArrowUpRight className="w-5 h-5 text-red-500" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {tx.type === "receive" ? `From ${tx.from}` : 
                         tx.type === "send" ? `To ${tx.to}` : 
                         "Yield Earned"}
                      </p>
                      <p className="text-sm text-gray-400">{tx.time}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${
                    tx.type === "receive" || tx.type === "yield" ? "text-green-500" : "text-red-500"
                  }`}>
                    {tx.type === "receive" || tx.type === "yield" ? "+" : "-"}{tx.amount} BTC
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="bg-gray-900/50 rounded-3xl p-6 border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4">Referral Rewards</h3>
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Your Rank</span>
                </div>
                <span className="text-2xl font-bold">#42</span>
              </div>
              <div className="bg-black/30 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full w-3/4" />
              </div>
              <p className="text-sm text-gray-400">750 / 1000 points to next level</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Friends Invited</span>
                </div>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span>Total Earned</span>
                </div>
                <span className="font-semibold">0.0012 BTC</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:scale-105 transition">
              Invite Friends & Earn
            </button>
          </motion.div>
        </div>
      </div>
    </main>
  )
}