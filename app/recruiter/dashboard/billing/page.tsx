'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Plus, Star, Loader2, CreditCard, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from './actions';
import { Input } from '@/components/ui/input';

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
            '50 Job Postings per month',
            'Advanced applicant filtering',
            'Public Job Sharing Links',
            'Featured company listing',
            'Dedicated support',
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
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
    const [customAmount, setCustomAmount] = useState<number | ''>('');
    const [isCustomProcessing, setIsCustomProcessing] = useState(false);
    const [customPrice, setCustomPrice] = useState({ total: 0, pricePerCredit: 30 });

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

    useEffect(() => {
        // Fetch the user's current subscription from the database
        const fetchCurrentPlan = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: recruiter, error: recruiterError } = await supabase
                    .from('recruiters')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (recruiterError) {
                    console.error('Error fetching recruiter:', recruiterError);
                    toast({ title: 'Error', description: 'Could not fetch your recruiter profile.', variant: 'destructive' });
                    setIsLoading(false);
                    return;
                }
                
                if (recruiter) {
                    const { data: subscriptionData, error: subscriptionError } = await supabase
                        .from('recruiter_subscriptions')
                        .select('plan_id, status')
                        .eq('recruiter_id', recruiter.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    if (subscriptionError && subscriptionError.code !== 'PGRST116') { // Ignore no rows found
                        console.error('Error fetching recruiter subscription:', subscriptionError);
                        toast({ title: 'Error', description: 'Could not fetch your current plan.', variant: 'destructive' });
                    } else if (subscriptionData && subscriptionData.status === 'active') {
                        setCurrentPlanId(subscriptionData.plan_id);
                    } else {
                        setCurrentPlanId('free');
                    }
                }
            }
            setIsLoading(false);
        };
        
        fetchCurrentPlan();

        // Check for successful payment and refresh if needed
        if (searchParams.get('status') === 'success') {
            toast({
                title: 'Payment Successful!',
                description: 'Your plan has been updated.',
            });
            // Refresh the page to clear query params and fetch new data
            router.replace('/recruiter/dashboard/billing');
            router.refresh(); 
        }

        if (searchParams.get('status') === 'canceled') {
            toast({
                title: 'Payment Canceled',
                description: 'Your payment process was canceled.',
                variant: 'destructive'
            });
            router.replace('/recruiter/dashboard/billing');
        }

    }, [supabase, toast, searchParams, router]);

    const handlePlanPurchase = async (planId: string) => {
        setIsProcessing(planId);
        try {
            await createCheckoutSession(planId);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsProcessing(null);
        }
    };
    
    const handleCreditPurchase = async (amount: number) => {
        setIsProcessing(`credits_${amount}`);
        try {
            await createCheckoutSession('credits', amount);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsProcessing(null);
        }
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setCustomAmount('');
            setCustomPrice({ total: 0, pricePerCredit: 30 });
        } else {
            const amount = parseInt(value, 10);
            if (!isNaN(amount) && amount >= 0) {
                setCustomAmount(amount);
                setCustomPrice(calculateCustomPrice(amount));
            }
        }
    };

    const handleCustomCreditPurchase = async () => {
        if (typeof customAmount !== 'number' || customAmount <= 0) return;
        setIsCustomProcessing(true);
        try {
            await createCheckoutSession('credits', customAmount);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsCustomProcessing(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;
    }

    return (
        <div className="space-y-12">
            {/* Section 1: Subscription Plans */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Subscription Plans</h2>
                <p className="text-gray-500 mb-6">Choose a plan that fits your hiring needs. You can upgrade or downgrade at any time.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                        <Card key={plan.id} className={`flex flex-col rounded-xl transition-all ${currentPlanId === plan.id ? 'border-purple-500 border-2 shadow-2xl' : 'border'}`}>
                           <CardHeader className="pb-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                                    {currentPlanId === plan.id && <Badge variant="outline" className="border-purple-500 text-purple-600">Current Plan</Badge>}
                                </div>
                                <p className="text-3xl font-bold pt-2">{plan.price}<span className="text-base font-normal text-gray-500">/month</span></p>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <ul className="space-y-3 text-sm">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3">
                                            <Check className="w-5 h-5 text-purple-500" />
                                            <span className="text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    size="lg"
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                                    disabled={currentPlanId === plan.id || !!isProcessing || plan.id === 'free'}
                                    onClick={() => handlePlanPurchase(plan.id)}
                                >
                                    {isProcessing === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {currentPlanId === plan.id ? 'Your Current Plan' : 'Upgrade Plan'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Section 2: Job Credits */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Purchase Job Credits</h2>
                <p className="text-gray-500 mb-6">Need a few extra posts? Top up your account with job credits for one-off postings.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     {creditOptions.map((option) => (
                        <Card key={option.amount} className={`rounded-xl transition-all flex flex-col items-center justify-center p-6 ${option.popular ? 'border-purple-500 border-2 shadow-2xl' : 'border'}`}>
                             {option.popular && <Badge className="absolute -top-3.5 bg-purple-600 hover:bg-purple-700">Most Popular</Badge>}
                            <p className="text-3xl font-bold">{option.amount} <span className="text-lg font-medium text-gray-500">Credits</span></p>
                            <p className="text-xl font-semibold text-gray-800 my-3">R{option.price}</p>
                            <Button 
                                className="w-full mt-2"
                                variant={option.popular ? "default" : "outline"}
                                disabled={!!isProcessing}
                                onClick={() => handleCreditPurchase(option.amount)}
                            >
                                {isProcessing === `credits_${option.amount}` && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Purchase
                            </Button>
                        </Card>
                    ))}
                    {/* Custom Credits Card */}
                    <Card className="rounded-xl transition-all flex flex-col items-center justify-center p-6 border">
                         <p className="text-3xl font-bold">Custom</p>
                        <p className="text-xl font-semibold text-gray-800 my-3">R{customPrice.total}</p>
                        <div className="w-full text-center">
                            <Input
                                type="number"
                                placeholder="Enter amount"
                                className="text-center text-md font-medium w-full mb-2"
                                value={customAmount}
                                onChange={handleCustomAmountChange}
                                min="1"
                            />
                             {typeof customAmount === 'number' && customAmount > 0 && (
                                <p className="text-xs text-gray-500 mb-2">
                                    (R{customPrice.pricePerCredit} / credit)
                                </p>
                            )}
                        </div>
                        <Button
                            className="w-full mt-auto"
                            variant="outline"
                            disabled={isCustomProcessing || !customAmount || customAmount <= 0}
                            onClick={handleCustomCreditPurchase}
                        >
                            {isCustomProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Purchase
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
} 