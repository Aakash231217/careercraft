
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Senior Software Engineer",
      company: "Zepto",
      content: "Got my dream job at Zepto! The AI mock interviews prepared me perfectly for the technical rounds.",
      rating: 4,
      avatar: "RS"
    },
    {
      name: "Priya Patel",
      role: "Product Manager",
      company: "Cred",
      content: "The resume analyzer helped me optimize my profile. Landed at Cred within 2 weeks!",
      rating: 5,
      avatar: "PP"
    },
    {
      name: "Arjun Mehta",
      role: "Data Scientist",
      company: "Groww",
      content: "Amazing AI-powered career guidance. The roadmap builder was a game-changer for my career.",
      rating: 5,
      avatar: "AM"
    },
    {
      name: "Sneha Iyer",
      role: "Frontend Developer",
      company: "Zeta",
      content: "Professional templates and personalized cover letters. Got multiple offers including Zeta!",
      rating: 4,
      avatar: "SI"
    },
    {
      name: "Vikram Singh",
      role: "DevOps Engineer",
      company: "Jio",
      content: "The salary guide feature helped me negotiate 40% higher package at Jio. Incredible tool!",
      rating: 4,
      avatar: "VS"
    },
    {
      name: "Kavya Reddy",
      role: "Marketing Analyst",
      company: "Byju's",
      content: "AI-powered insights transformed my job search strategy. Now working at Byju's!",
      rating: 5,
      avatar: "KR"
    },
    {
      name: "Rohan Gupta",
      role: "Machine Learning Engineer",
      company: "Zepto",
      content: "The quiz tool helped me assess my skills. Cracked Zepto's ML role with confidence!",
      rating: 5,
      avatar: "RG"
    },
    {
      name: "Aditi Sharma",
      role: "UX Designer",
      company: "Cred",
      content: "Portfolio feedback and career roadmap were spot-on. Joined Cred as a UX Designer!",
      rating: 4,
      avatar: "AS"
    },
    {
      name: "Karthik Nair",
      role: "Backend Developer",
      company: "Groww",
      content: "Mock interviews boosted my confidence. The technical preparation was excellent!",
      rating: 5,
      avatar: "KN"
    },
    {
      name: "Meera Joshi",
      role: "Product Analyst",
      company: "Jio",
      content: "From resume to interview prep, everything was perfect. Now at Jio as Product Analyst!",
      rating: 5,
      avatar: "MJ"
    }
  ];

  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals who've transformed their careers with our AI-powered platform
          </p>
        </motion.div>

        {/* Continuous Scrolling Container */}
        <div className="relative">
          <div className="flex space-x-6 animate-scroll">
            {duplicatedTestimonials.map((testimonial, index) => (
              <motion.div
                key={`${testimonial.name}-${index}`}
                className="flex-shrink-0 w-80"
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {testimonial.avatar}
                      </motion.div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{testimonial.name}</h4>
                        <p className="text-xs text-gray-600">{testimonial.role}</p>
                        <p className="text-xs text-blue-600 font-medium">{testimonial.company}</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Quote className="absolute -top-1 -left-1 h-6 w-6 text-purple-300 opacity-50" />
                      <p className="text-gray-700 italic text-sm leading-relaxed pl-4">
                        "{testimonial.content}"
                      </p>
                    </div>
                    
                    <div className="flex items-center mt-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Custom CSS for infinite scroll animation */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 100s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
