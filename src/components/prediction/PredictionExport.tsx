'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, Image, Mail, Share2, X } from 'lucide-react'
import { PredictionData } from '@/types/stock'
import { formatCurrency, formatPercent } from '@/utils/formatters'

interface PredictionExportProps {
  symbol: string
  predictions: PredictionData
  className?: string
}

export default function PredictionExport({ 
  symbol, 
  predictions, 
  className = '' 
}: PredictionExportProps) {
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const generatePDFReport = async () => {
    setIsExporting(true)
    
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default
      const html2canvas = (await import('html2canvas')).default
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Add title
      pdf.setFontSize(20)
      pdf.setTextColor(59, 130, 246) // Blue color
      pdf.text(`${symbol} - AI Prediction Report`, 20, 25)
      
      // Add generation date
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35)
      
      let yPosition = 50
      
      // Executive Summary
      pdf.setFontSize(14)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Executive Summary', 20, yPosition)
      yPosition += 10
      
      pdf.setFontSize(10)
      const currentPrice = formatCurrency(predictions.currentPrice)
      const mainPrediction = predictions.predictions.find(p => p.timeframe === '1m')
      const predictedPrice = mainPrediction ? formatCurrency(mainPrediction.predictedPrice) : 'N/A'
      const expectedReturn = mainPrediction ? formatPercent(mainPrediction.changePercent) : 'N/A'
      const confidence = mainPrediction ? `${mainPrediction.confidence.toFixed(1)}%` : 'N/A'
      
      const summaryText = [
        `Current Price: ${currentPrice}`,
        `1-Month Prediction: ${predictedPrice}`,
        `Expected Return: ${expectedReturn}`,
        `Confidence Level: ${confidence}`,
        `Model Accuracy: ${predictions.accuracy.toFixed(1)}%`,
      ]
      
      summaryText.forEach(text => {
        pdf.text(text, 25, yPosition)
        yPosition += 6
      })
      
      yPosition += 10
      
      // Predictions Table
      pdf.setFontSize(14)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Prediction Details', 20, yPosition)
      yPosition += 15
      
      // Table headers
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text('Timeframe', 25, yPosition)
      pdf.text('Price Target', 60, yPosition)
      pdf.text('Expected Return', 100, yPosition)
      pdf.text('Confidence', 140, yPosition)
      pdf.text('Direction', 170, yPosition)
      yPosition += 8
      
      // Table data
      pdf.setTextColor(0, 0, 0)
      predictions.predictions.forEach(pred => {
        pdf.text(pred.timeframe.toUpperCase(), 25, yPosition)
        pdf.text(formatCurrency(pred.predictedPrice), 60, yPosition)
        pdf.text(formatPercent(pred.changePercent), 100, yPosition)
        pdf.text(`${pred.confidence.toFixed(1)}%`, 140, yPosition)
        pdf.text(pred.direction.toUpperCase(), 170, yPosition)
        yPosition += 6
      })
      
      yPosition += 15
      
      // Factor Analysis
      pdf.setFontSize(14)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Factor Analysis', 20, yPosition)
      yPosition += 15
      
      pdf.setFontSize(10)
      Object.entries(predictions.factors).forEach(([factor, value]) => {
        pdf.text(`${factor.charAt(0).toUpperCase() + factor.slice(1)}: ${value.toFixed(1)}%`, 25, yPosition)
        yPosition += 6
      })
      
      // Add new page if needed
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = 25
      }
      
      yPosition += 15
      
      // Risk Assessment
      if (predictions.scenarioAnalysis) {
        pdf.setFontSize(14)
        pdf.setTextColor(0, 0, 0)
        pdf.text('Scenario Analysis', 20, yPosition)
        yPosition += 15
        
        pdf.setFontSize(10)
        Object.entries(predictions.scenarioAnalysis).forEach(([scenario, data]) => {
          pdf.text(`${scenario.toUpperCase()} Case:`, 25, yPosition)
          yPosition += 6
          pdf.text(`  Probability: ${data.probability}%`, 30, yPosition)
          yPosition += 5
          pdf.text(`  Price Target: ${formatCurrency(data.predictedPrice)}`, 30, yPosition)
          yPosition += 5
          pdf.text(`  Key Factors: ${data.factors.slice(0, 2).join(', ')}`, 30, yPosition)
          yPosition += 10
        })
      }
      
      // Footer
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text('Disclaimer: This report is for informational purposes only and should not be considered as financial advice.', 20, pageHeight - 20)
      pdf.text('Generated by StockVision Pro AI Prediction Engine', 20, pageHeight - 15)
      
      // Save the PDF
      pdf.save(`${symbol}_prediction_report_${new Date().toISOString().split('T')[0]}.pdf`)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF report. Please try again.')
    } finally {
      setIsExporting(false)
      setShowExportMenu(false)
    }
  }

  const exportToCSV = () => {
    const csvData = [
      ['Timeframe', 'Current Price', 'Predicted Price', 'Expected Return (%)', 'Confidence (%)', 'Direction'],
      ...predictions.predictions.map(pred => [
        pred.timeframe,
        predictions.currentPrice.toFixed(2),
        pred.predictedPrice.toFixed(2),
        pred.changePercent.toFixed(2),
        pred.confidence.toFixed(1),
        pred.direction
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${symbol}_predictions_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const shareReport = async () => {
    const shareData = {
      title: `${symbol} AI Prediction Report`,
      text: `AI prediction for ${symbol}: ${formatCurrency(predictions.currentPrice)} → ${formatCurrency(predictions.predictions[0]?.predictedPrice || 0)} (${formatPercent(predictions.predictions[0]?.changePercent || 0)})`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
      alert('Report details copied to clipboard!')
    }
    setShowExportMenu(false)
  }

  const exportOptions = [
    {
      id: 'pdf',
      label: 'PDF Report',
      icon: FileText,
      description: 'Comprehensive prediction report',
      action: generatePDFReport,
    },
    {
      id: 'csv',
      label: 'CSV Data',
      icon: Download,
      description: 'Raw prediction data',
      action: exportToCSV,
    },
    {
      id: 'share',
      label: 'Share Report',
      icon: Share2,
      description: 'Share prediction summary',
      action: shareReport,
    },
  ]

  return (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setShowExportMenu(!showExportMenu)}
        disabled={isExporting}
        className={className}
      >
        {isExporting ? (
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span className="hidden sm:block">
          {isExporting ? 'Exporting...' : 'Export'}
        </span>
      </button>

      {/* Export Menu */}
      <AnimatePresence>
        {showExportMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowExportMenu(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full right-0 mt-2 w-80 glass-card border border-white/20 shadow-2xl z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Export Prediction</h3>
                <button
                  onClick={() => setShowExportMenu(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Export Options */}
              <div className="p-4 space-y-3">
                {exportOptions.map((option, index) => {
                  const Icon = option.icon
                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={option.action}
                      disabled={isExporting}
                      className="w-full flex items-center space-x-3 p-3 glass rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-medium text-white">{option.label}</h4>
                        <p className="text-sm text-gray-400">{option.description}</p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10">
                <p className="text-xs text-gray-400 text-center">
                  Reports include predictions, confidence levels, and risk analysis
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
