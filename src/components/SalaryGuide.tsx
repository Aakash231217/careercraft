
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Lightbulb, MapPin, Briefcase, Target, IndianRupee, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';

interface SalaryData {
  position: string;
  country: string;
  experience: string;
  customPosition?: string;
}

interface SalaryRange {
  min: number;
  max: number;
  avg: number;
  currency: string;
  symbol: string;
  tips: string[];
}

const SalaryGuide = () => {
  const [salaryResult, setSalaryResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const form = useForm<SalaryData>({
    defaultValues: {
      position: '',
      country: '',
      experience: '',
      customPosition: ''
    }
  });

  const positions = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'Product Manager',
    'UX/UI Designer',
    'DevOps Engineer',
    'Marketing Manager',
    'Sales Manager',
    'Business Analyst',
    'Project Manager',
    'Mobile App Developer',
    'AI/ML Engineer',
    'Cybersecurity Specialist',
    'Cloud Architect',
    'Database Administrator',
    'Quality Assurance Engineer',
    'Technical Writer',
    'Scrum Master',
    'Custom Position'
  ];

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Germany',
    'France',
    'Australia',
    'Netherlands',
    'Sweden',
    'Switzerland',
    'Singapore',
    'India',
    'Brazil',
    'Japan',
    'South Korea',
    'Italy',
    'Spain',
    'New Zealand',
    'Ireland',
    'Denmark',
    'Norway'
  ];

  const experienceLevels = [
    '0-1 years (Entry Level)',
    '1-3 years (Junior)',
    '3-5 years (Mid Level)',
    '5-8 years (Senior)',
    '8-12 years (Lead/Principal)',
    '12+ years (Executive/Director)'
  ];

  const formatSalary = (amount: number, currency: string, symbol: string) => {
    if (currency === 'INR') {
      if (amount >= 100000) {
        return `${symbol}${(amount / 100000).toFixed(1)} LPA`;
      }
      return `${symbol}${amount.toLocaleString('en-IN')}`;
    }
    return `${symbol}${amount.toLocaleString()}`;
  };

  const fetchSalaryData = async (position: string, country: string, experience: string): Promise<SalaryRange> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-salary-data', {
        body: { position, country, experience }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching salary data:', error);
      throw new Error('Failed to fetch salary data. Please try again.');
    }
  };

  const onSubmit = async (data: SalaryData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const finalPosition = data.position === 'Custom Position' ? data.customPosition : data.position;
      
      if (!finalPosition) {
        setError('Please specify a position');
        setIsLoading(false);
        return;
      }

      const salaryRange = await fetchSalaryData(finalPosition, data.country, data.experience);
      
      setSalaryResult({
        position: finalPosition,
        country: data.country,
        experience: data.experience,
        salaryRange
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while fetching salary data');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'INR':
        return IndianRupee;
      default:
        return DollarSign;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 space-y-8"
      >
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI-Powered Salary Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get real-time salary insights and expert negotiation strategies powered by AI
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-white/40 dark:border-gray-700/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Target className="mr-3 h-8 w-8 text-blue-600" />
                  Salary Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="position"
                      rules={{ required: 'Please select a position' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4" />
                            Job Position
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-gray-700">
                                <SelectValue placeholder="Select your position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {positions.map((position) => (
                                <SelectItem key={position} value={position}>
                                  {position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch('position') === 'Custom Position' && (
                      <FormField
                        control={form.control}
                        name="customPosition"
                        rules={{ required: 'Please enter your position title' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Position Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your position title" 
                                {...field} 
                                className="bg-white dark:bg-gray-700"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="experience"
                      rules={{ required: 'Please select your experience level' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            Years of Experience
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-gray-700">
                                <SelectValue placeholder="Select your experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {experienceLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      rules={{ required: 'Please select a country' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4" />
                            Country/Location
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-gray-700">
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        React.createElement(getCurrencyIcon(form.watch('country') === 'India' ? 'INR' : 'USD'), { className: "mr-2 h-4 w-4" })
                      )}
                      {isLoading ? 'Getting AI Insights...' : 'Get AI Salary Insights'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {salaryResult && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-white/40 dark:border-gray-700/40 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <TrendingUp className="mr-3 h-8 w-8 text-green-600" />
                    AI Salary Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{salaryResult.position}</h3>
                      <div className="flex flex-col gap-2">
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {salaryResult.country} ({salaryResult.salaryRange.currency})
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {salaryResult.experience}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <motion.div 
                        className="text-center p-4 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-xl font-bold text-red-800 dark:text-red-200">
                          {formatSalary(salaryResult.salaryRange.min, salaryResult.salaryRange.currency, salaryResult.salaryRange.symbol)}
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-300">Minimum</div>
                      </motion.div>
                      <motion.div 
                        className="text-center p-4 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-xl font-bold text-green-800 dark:text-green-200">
                          {formatSalary(salaryResult.salaryRange.avg, salaryResult.salaryRange.currency, salaryResult.salaryRange.symbol)}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-300">Average</div>
                      </motion.div>
                      <motion.div 
                        className="text-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                          {formatSalary(salaryResult.salaryRange.max, salaryResult.salaryRange.currency, salaryResult.salaryRange.symbol)}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-300">Maximum</div>
                      </motion.div>
                    </div>
                  </div>

                  <div>
                    <h4 className="flex items-center text-lg font-semibold mb-4">
                      <Lightbulb className="mr-2 h-5 w-5 text-yellow-600" />
                      AI-Generated Negotiation Tips
                    </h4>
                    <div className="space-y-3">
                      {salaryResult.salaryRange.tips?.map((tip: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-3 p-3 bg-white/60 dark:bg-gray-700/60 rounded-lg shadow-sm"
                        >
                          <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{tip}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SalaryGuide;
