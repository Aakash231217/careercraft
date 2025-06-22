
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image, File } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  content?: string;
}

const DownloadModal = ({ isOpen, onClose, documentType, content }: DownloadModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const formats = [
    { 
      id: 'pdf', 
      name: 'PDF', 
      icon: FileText, 
      description: 'Best for sharing and printing',
      color: 'from-red-500 to-pink-500'
    },
    { 
      id: 'docx', 
      name: 'Word Document', 
      icon: File, 
      description: 'Editable format',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'html', 
      name: 'HTML File', 
      icon: FileText, 
      description: 'Styled web page format',
      color: 'from-yellow-400 to-orange-400'
    },
    { 
      id: 'txt', 
      name: 'Text File', 
      icon: FileText, 
      description: 'Simple text format',
      color: 'from-gray-500 to-gray-600'
    },
    { 
      id: 'png', 
      name: 'PNG Image', 
      icon: Image, 
      description: 'High-quality image format',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const downloadAsTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download as HTML with inlined CSS
  const downloadAsHtmlFile = (content: string, filename: string) => {
    const css = `
      body { background: linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%); font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
      .portfolio-header { text-align: center; margin-bottom: 2rem; }
      .portfolio-section { margin: 2rem 0; background: #fff; border-radius: 8px; padding: 1rem 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
      .portfolio-section h2 { font-size: 22px; font-weight: 600; margin-bottom: 0.5rem; }
      .badge { display: inline-block; padding: 0.25em 0.75em; border-radius: 9999px; background: #e0e7ff; color: #3730a3; margin: 0 0.25em 0.5em 0; font-size: 0.95em; }
      .card { border-radius: 8px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.03); margin-bottom: 1.5rem; }
      .card-content { padding: 1.5rem; }
      .contact-list { display: grid; grid-template-columns: 1fr 1fr; gap: 1em; }
      .contact-list div { display: flex; align-items: center; gap: 0.5em; }
    `;
    const html = `<!DOCTYPE html>
<html><head><meta charset='UTF-8'><title>Portfolio</title><style>${css}</style></head><body>${content}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const generatePDF = (content: string, filename: string) => {
    try {
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      const lineHeight = 7;
      const maxLineWidth = pageWidth - 2 * margin;
      
      // Add title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(documentType, margin, margin + 10);
      
      // Add content
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const lines = content.split('\n');
      let currentY = margin + 30;
      
      lines.forEach((line) => {
        if (line.trim() === '') {
          currentY += lineHeight;
          return;
        }
        
        // Split long lines
        const splitLines = pdf.splitTextToSize(line, maxLineWidth);
        
        splitLines.forEach((splitLine: string) => {
          if (currentY > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          
          pdf.text(splitLine, margin, currentY);
          currentY += lineHeight;
        });
      });
      
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const handleDownload = async () => {
    if (!content) {
      toast({
        title: "No content to download",
        description: "Please generate content first before downloading.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      const filename = `${documentType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      
      switch (selectedFormat) {
        case 'txt':
          downloadAsTextFile(content, `${filename}.txt`);
          break;
        case 'html':
          downloadAsHtmlFile(content, `${filename}.html`);
          break;
        case 'pdf':
          generatePDF(content, `${filename}.pdf`);
          break;
        case 'docx':
          // Download as rich text format that can be opened in Word
          const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} \\f0\\fs24 ${content.replace(/\n/g, '\\par ')}}`;
          const blob = new Blob([rtfContent], { type: 'application/rtf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.rtf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          break;
        case 'png':
          // Create a canvas with the text content
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 800;
          canvas.height = 1000;
          
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';
            ctx.font = '14px Arial';
            
            const lines = content.split('\n');
            let y = 40;
            lines.forEach(line => {
              if (y < canvas.height - 20) {
                ctx.fillText(line, 40, y);
                y += 20;
              }
            });
            
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${filename}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }
            });
          }
          break;
        default:
          downloadAsTextFile(content, `${filename}.txt`);
      }

      toast({
        title: "Download started",
        description: `Your ${documentType.toLowerCase()} is being downloaded as ${selectedFormat.toUpperCase()}.`,
      });

      setTimeout(() => {
        setIsDownloading(false);
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your file. Please try again.",
        variant: "destructive",
      });
      setIsDownloading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <DialogHeader>
            <motion.div variants={itemVariants}>
              <DialogTitle className="flex items-center text-2xl">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.3 }}
                >
                  <Download className="h-6 w-6 mr-3 text-purple-600" />
                </motion.div>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Download {documentType}
                </span>
              </DialogTitle>
            </motion.div>
          </DialogHeader>
          
          <div className="space-y-6">
            <motion.p variants={itemVariants} className="text-gray-600 text-lg">
              Choose your preferred format to download your {documentType.toLowerCase()}.
            </motion.p>
            
            <motion.div variants={itemVariants} className="space-y-3">
              {formats.map((format) => (
                <motion.button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedFormat === format.id
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center">
                    <motion.div 
                      className={`p-3 rounded-lg bg-gradient-to-r ${format.color} text-white mr-4 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <format.icon className="h-6 w-6" />
                    </motion.div>
                    <div className="text-left">
                      <div className="font-semibold text-lg text-gray-800">{format.name}</div>
                      <div className="text-gray-600">{format.description}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex space-x-3 pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1"
              >
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="w-full h-12 border-2 border-gray-300 hover:border-gray-400 text-lg"
                  disabled={isDownloading}
                >
                  Cancel
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1"
              >
                <Button 
                  onClick={handleDownload}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg transform transition-all duration-200"
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Downloading...
                    </motion.div>
                  ) : (
                    `Download ${selectedFormat.toUpperCase()}`
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadModal;
