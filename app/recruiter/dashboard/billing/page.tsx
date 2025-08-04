'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession, cancelSubscription } from './actions';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const plans = [
    {
        id: 'free',
        name: 'Free',
        price: 'R0',
        features: ['10 Job Postings per month', 'Basic applicant tracking', 'Company profile'],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 'R499',
        features: [
            'Unlimited Job Postings',
            'Advanced applicant filtering',
            'Public Job Sharing Links',
            'Featured company listing',
            'Dedicated support',
            'AI-powered candidate analysis',
        ],
    },
];

const creditOptions = [
    { amount: 5, price: 150, popular: false },
    { amount: 10, price: 250, popular: true },
    { amount: 25, price: 500, popular: false },
];

export default function BillingPage() {
    const supabase = createClient();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);
    const [jobCredits, setJobCredits] = useState<number>(0);
    const [customAmount, setCustomAmount] = useState<number | ''>('');
    const [customPrice, setCustomPrice] = useState({ total: 0, pricePerCredit: 30 });

    const fetchBillingData = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: recruiter, error: recruiterError } = await supabase
                .from('recruiters')
                .select('id, job_credits')
                .eq('user_id', user.id)
                .single();

            if (recruiterError) {
                toast({ title: 'Error', description: 'Could not fetch your recruiter profile.', variant: 'destructive' });
            } else if (recruiter) {
                setJobCredits(recruiter.job_credits || 0);
                const { data: subscriptionData, error: subscriptionError } = await supabase
                    .from('recruiter_subscriptions')
                    .select('*')
                    .eq('recruiter_id', recruiter.id)
                    .order('created_at', { ascending: false }).limit(1).single();

                if (subscriptionError && subscriptionError.code !== 'PGRST116') {
                    toast({ title: 'Error', description: 'Could not fetch your current plan.', variant: 'destructive' });
                } else if (subscriptionData && subscriptionData.status === 'active') {
                    setSubscription(subscriptionData);
                } else {
                    setSubscription(null);
                }
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchBillingData();
    }, []);

    const handlePlanPurchase = async (planId: string) => {
        setIsProcessing(planId);
        try { await createCheckoutSession(planId); } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally { setIsProcessing(null); }
    };
    
    const handleCreditPurchase = async (amount: number) => {
        setIsProcessing(`credits_${amount}`);
        try { await createCheckoutSession('credits', amount); } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally { setIsProcessing(null); }
    };

    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        try {
            await cancelSubscription();
            toast({ title: 'Subscription Cancelled', description: 'Your plan will not renew at the end of the current billing period.' });
            await fetchBillingData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsCancelling(false);
        }
    };
    
    const calculateCustomPrice = (amount: number) => {
        if (amount <= 0) return { total: 0, pricePerCredit: 30 };
        let pricePerCredit = 30;
        if (amount >= 25) {
            pricePerCredit = 20;
        } else if (amount >= 10) {
            pricePerCredit = 25;
        }
        return { total: amount * pricePerCredit, pricePerCredit };
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const amount = value === '' ? '' : parseInt(value, 10);
        
        if (amount === '' || (!isNaN(amount) && amount >= 0)) {
            setCustomAmount(amount);
            if (typeof amount === 'number') {
                setCustomPrice(calculateCustomPrice(amount));
            }
        }
    };

    const handleCustomCreditPurchase = async () => {
        if (typeof customAmount !== 'number' || customAmount <= 0) return;
        setIsProcessing('custom_credits');
        try { 
            await createCheckoutSession('credits', customAmount); 
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally { 
            setIsProcessing(null); 
        }
    };

    if (isLoading) {
        return <div className="p-8"><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-theme-600" /></div></div>;
    }

    const currentPlanId = subscription?.status === 'active' || subscription?.status === 'cancelled' ? subscription.plan_id : 'free';
    const isCancelled = subscription?.status === 'cancelled';

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 sm:p-6 lg:p-8 space-y-12">
            
            {/* Section 1: Subscription Plans */}
            <div>
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Billing & Plans</h1>
                    <p className="text-gray-500 mt-1">{currentPlanId === 'premium' ? 'Manage your current plan and credit balance.' : 'Choose a plan that fits your hiring needs.'}</p>
                </header>
                
                <div className={`grid grid-cols-1 ${currentPlanId === 'premium' ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-8 items-start`}>
                    {plans.map((plan) => (
                        currentPlanId === 'premium' && plan.id !== 'premium' ? null :
                        <motion.div key={plan.id} className={`bg-white rounded-2xl p-8 border border-gray-100 flex flex-col relative overflow-hidden shadow-lg w-full ${currentPlanId === plan.id ? 'max-w-lg mx-auto' : 'max-w-md'}`}>
                             {currentPlanId === plan.id && !isCancelled && <Badge variant="outline" className="absolute top-6 right-6 border-theme-200 bg-theme-50 text-theme-700 font-semibold">Current Plan</Badge>}
                             {isCancelled && plan.id === 'premium' && <Badge variant="destructive" className="absolute top-6 right-6">Cancels on {new Date(subscription.current_period_end).toLocaleDateString()}</Badge>}
                            
                            <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                            <p className="text-4xl font-bold pt-4 text-gray-800">{plan.price}<span className="text-lg font-medium text-gray-500">/month</span></p>
                            
                            <ul className="mt-8 space-y-4 text-sm flex-grow">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3"><Check className="w-5 h-5 text-theme-500" /><span className="text-gray-600">{feature}</span></li>
                                ))}
                            </ul>

                            {currentPlanId === 'premium' && plan.id === 'premium' && (
                                <>
                                <div className="border-t border-gray-100 my-8"></div>
                                <div className="text-sm space-y-3">
                                    <div className="flex justify-between items-center"><span className="text-gray-500">Next Billing Date</span><span className="font-semibold text-gray-800">{subscription ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-500">Job Posting Limit</span><span className="font-semibold text-gray-800 text-green-600">Unlimited</span></div>
                                </div>
                                </>
                            )}
                            
                            {plan.id === 'premium' && currentPlanId === 'premium' ? (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="lg" className="w-full mt-8" variant='outline' disabled={isProcessing !== null || isCancelled || isCancelling}>
                                            {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {isCancelled ? 'Plan Cancellation Pending' : 'Cancel Plan'}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Cancel Your Subscription?</AlertDialogTitle><AlertDialogDescription>This will cancel your Premium plan at the end of your current billing period on {subscription ? new Date(subscription.current_period_end).toLocaleDateString() : ''}. You will not be charged again.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter><AlertDialogCancel>Keep Plan</AlertDialogCancel><AlertDialogAction onClick={handleCancelSubscription}>Confirm Cancellation</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <Button size="lg" className="w-full mt-8" variant={'default'} disabled={isProcessing !== null || plan.id === 'free'} onClick={() => handlePlanPurchase(plan.id)}>
                                    {isProcessing === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {'Upgrade Plan'}
                                </Button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Section 2: Job Credits - Only for Free Plan */}
            {currentPlanId !== 'premium' && (
                <div className="pt-8">
                     <header className="mb-8">
                         <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Buy Job Credits</h2>
                         <p className="text-gray-500 mt-1">Top up your account with credits to post more jobs. Credits never expire.</p>
                     </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {creditOptions.map((opt) => (
                            <motion.div key={opt.amount} whileHover={{ y: -5, boxShadow: '0 8px 15px rgba(0,0,0,0.06)' }} transition={{ type: 'spring', stiffness: 300 }} className={`bg-white rounded-xl p-6 border border-gray-100 relative flex flex-col items-center justify-center text-center shadow-md`}>
                                {opt.popular && <Badge className="absolute -top-3 bg-theme-600 text-white font-semibold">Most Popular</Badge>}
                                <h3 className="text-lg font-semibold text-gray-800">{opt.amount} Credits</h3>
                                <p className="text-3xl font-bold text-gray-900 mt-2">R{opt.price}</p>
                                <Button size="lg" className="w-full mt-6" variant="outline" disabled={isProcessing !== null} onClick={() => handleCreditPurchase(opt.amount)}>
                                    {isProcessing === `credits_${opt.amount}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Buy Credits'}
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Custom credit purchase */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                         <h3 className="text-xl font-semibold text-gray-800 text-center">Or Buy a Custom Amount</h3>
                        <div className="max-w-md mx-auto mt-6 flex flex-col items-center gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-md">
                            <Input type="number" placeholder="Enter number of credits" value={customAmount} onChange={handleCustomAmountChange} className="text-center text-lg" min="1"/>
                            {Number(customAmount) > 0 && (
                            <div className="text-center w-full">
                                <p className="text-gray-600">Price per credit: <span className="font-semibold">R{customPrice.pricePerCredit}</span></p>
                                <p className="text-2xl font-bold text-gray-800 mt-2">Total: R{customPrice.total}</p>
                            </div>
                            )}
                            <Button size="lg" className="w-full mt-4" disabled={isProcessing !== null || !customAmount} onClick={handleCustomCreditPurchase}>
                                {isProcessing === 'custom_credits' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Buy Custom Amount'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Plan Benefits Section */}
            {currentPlanId === 'premium' && (
                <div className="pt-8">
                    <header className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Premium Benefits</h2>
                        <p className="text-gray-500 mt-1">Enjoy unlimited job postings and advanced features with your Premium plan.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl p-6 border border-gray-100 shadow-md">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Check className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Unlimited Job Postings</h3>
                            </div>
                            <p className="text-gray-600 text-sm">Post as many jobs as you need without worrying about limits or credits.</p>
                        </motion.div>

                        <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl p-6 border border-gray-100 shadow-md">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Check className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                            </div>
                            <p className="text-gray-600 text-sm">Get AI-powered insights on candidates to make better hiring decisions.</p>
                        </motion.div>

                        <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl p-6 border border-gray-100 shadow-md">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Check className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Public Sharing</h3>
                            </div>
                            <p className="text-gray-600 text-sm">Share job postings publicly with custom links for wider reach.</p>
                        </motion.div>

                        <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl p-6 border border-gray-100 shadow-md">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Check className="w-5 h-5 text-orange-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Featured Listing</h3>
                            </div>
                            <p className="text-gray-600 text-sm">Your company gets featured placement in job search results.</p>
                        </motion.div>

                        <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl p-6 border border-gray-100 shadow-md">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <Check className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Dedicated Support</h3>
                            </div>
                            <p className="text-gray-600 text-sm">Priority support from our team to help you succeed.</p>
                        </motion.div>

                        <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl p-6 border border-gray-100 shadow-md">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <Check className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Advanced Filtering</h3>
                            </div>
                            <p className="text-gray-600 text-sm">Advanced tools to filter and find the best candidates quickly.</p>
                        </motion.div>
                    </div>
                </div>
            )}
        </motion.div>
    );
} 