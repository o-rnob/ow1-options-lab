"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Dummy data for option chain
const optionChainData = [
  { strike: 95, callPrice: 8.45, putPrice: 1.23, ivCall: 0.28, ivPut: 0.31 },
  { strike: 100, callPrice: 5.12, putPrice: 2.31, ivCall: 0.25, ivPut: 0.27 },
  { strike: 105, callPrice: 2.87, putPrice: 4.15, ivCall: 0.23, ivPut: 0.24 },
  { strike: 110, callPrice: 1.34, putPrice: 7.22, ivCall: 0.26, ivPut: 0.22 },
  { strike: 115, callPrice: 0.67, putPrice: 11.45, ivCall: 0.29, ivPut: 0.25 },
]

// Dummy data for chart
const chartData = [
  { strike: 90, callPrice: 12.5, putPrice: 0.8 },
  { strike: 95, callPrice: 8.45, putPrice: 1.23 },
  { strike: 100, callPrice: 5.12, putPrice: 2.31 },
  { strike: 105, callPrice: 2.87, putPrice: 4.15 },
  { strike: 110, callPrice: 1.34, putPrice: 7.22 },
  { strike: 115, callPrice: 0.67, putPrice: 11.45 },
  { strike: 120, callPrice: 0.25, putPrice: 16.8 },
]

export default function TradingDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    spotPrice: "100",
    strike: "100",
    volatility: "0.25",
    riskFreeRate: "0.05",
    dividendYield: "0.02",
    expiry: "30",
    optionType: "call",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Ow1 Options Lab</h1>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -300 }}
          animate={{
            opacity: 1,
            x: 0,
            width: sidebarOpen || window.innerWidth >= 1024 ? "320px" : "0px",
          }}
          transition={{ duration: 0.3 }}
          className={`
            fixed lg:relative top-0 left-0 h-screen bg-white border-r z-40 overflow-hidden
            ${sidebarOpen ? "block" : "hidden lg:block"}
          `}
        >
          <div className="p-6 pt-20 lg:pt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Option Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="spotPrice">Spot Price (S)</Label>
                      <Input
                        id="spotPrice"
                        value={formData.spotPrice}
                        onChange={(e) => handleInputChange("spotPrice", e.target.value)}
                        className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="strike">Strike (K)</Label>
                      <Input
                        id="strike"
                        value={formData.strike}
                        onChange={(e) => handleInputChange("strike", e.target.value)}
                        className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="volatility">Volatility (σ)</Label>
                    <Input
                      id="volatility"
                      value={formData.volatility}
                      onChange={(e) => handleInputChange("volatility", e.target.value)}
                      className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="riskFreeRate">Risk-free Rate (r)</Label>
                      <Input
                        id="riskFreeRate"
                        value={formData.riskFreeRate}
                        onChange={(e) => handleInputChange("riskFreeRate", e.target.value)}
                        className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dividendYield">Dividend Yield (q)</Label>
                      <Input
                        id="dividendYield"
                        value={formData.dividendYield}
                        onChange={(e) => handleInputChange("dividendYield", e.target.value)}
                        className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expiry">Expiry (T in days)</Label>
                    <Input
                      id="expiry"
                      value={formData.expiry}
                      onChange={(e) => handleInputChange("expiry", e.target.value)}
                      className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="optionType">Option Type</Label>
                    <Select
                      value={formData.optionType}
                      onValueChange={(value) => handleInputChange("optionType", value)}
                    >
                      <SelectTrigger className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="put">Put</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg"
                    >
                      Calculate Options
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
            {/* Option Chain Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Option Chain</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Strike</th>
                        <th className="text-left py-3 px-4 font-semibold">Call Price</th>
                        <th className="text-left py-3 px-4 font-semibold">Put Price</th>
                        <th className="text-left py-3 px-4 font-semibold">IV Call</th>
                        <th className="text-left py-3 px-4 font-semibold">IV Put</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionChainData.map((row, index) => (
                        <motion.tr
                          key={row.strike}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                          className={`border-b transition-all duration-200 ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-blue-50`}
                        >
                          <td className="py-3 px-4 font-medium">{row.strike}</td>
                          <td className="py-3 px-4 text-green-600">${row.callPrice.toFixed(2)}</td>
                          <td className="py-3 px-4 text-red-600">${row.putPrice.toFixed(2)}</td>
                          <td className="py-3 px-4">{(row.ivCall * 100).toFixed(1)}%</td>
                          <td className="py-3 px-4">{(row.ivPut * 100).toFixed(1)}%</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {optionChainData.map((row, index) => (
                    <motion.div
                      key={row.strike}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      className="bg-white border rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-lg">Strike: {row.strike}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Call Price:</span>
                          <span className="ml-2 text-green-600 font-medium">${row.callPrice.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Put Price:</span>
                          <span className="ml-2 text-red-600 font-medium">${row.putPrice.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">IV Call:</span>
                          <span className="ml-2 font-medium">{(row.ivCall * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">IV Put:</span>
                          <span className="ml-2 font-medium">{(row.ivPut * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Option Price Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Option Price Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="strike"
                        label={{ value: "Strike Price", position: "insideBottom", offset: -10 }}
                      />
                      <YAxis label={{ value: "Option Price ($)", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
                        labelFormatter={(label) => `Strike: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="callPrice"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Call Price"
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="putPrice"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Put Price"
                        dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
