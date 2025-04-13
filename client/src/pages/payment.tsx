import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';
import { ServiceWithUser, paymentMethods } from '@/lib/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, DollarSign } from 'lucide-react';

// Define payment form schema
const paymentSchema = z.object({
  cardNumber: z.string().min(1, 'Card number is required'),
  cardholderName: z.string().min(1, 'Cardholder name is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  cvc: z.string().min(1, 'CVC is required'),
  billingAddress: z.string().min(1, 'Billing address is required'),
  paymentMethod: z.enum(['credit_card', 'paypal', 'stripe']),
});

// Define payment form values type
type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentPage() {
  // Get service ID from URL
  const [, params] = useRoute('/payment');
  const query = new URLSearchParams(window.location.search);
  const serviceId = query.get('serviceId');

  // Set up state and hooks
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to complete your order.',
        variant: 'destructive',
      });
      setLocation('/auth/login');
    }
  }, [isAuthenticated, toast, setLocation]);

  // Fetch service details
  const {
    data: service,
    isLoading,
    error,
  } = useQuery<ServiceWithUser>({
    queryKey: [`/api/services/${serviceId}`],
    enabled: !!serviceId,
  });

  // Initialize form
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvc: '',
      billingAddress: '',
      paymentMethod: 'credit_card',
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (data: PaymentFormValues) => {
      return apiRequest('POST', `/api/services/${serviceId}/orders`, data);
    },
    onSuccess: () => {
      setIsProcessing(false);
      toast({
        title: 'Order Placed Successfully',
        description: 'Your order has been placed. Thank you for your purchase!',
      });
      // Redirect to home page after successful order
      setLocation('/');
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: 'Order Failed',
        description: error.message || 'There was an error processing your order. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: PaymentFormValues) => {
    setIsProcessing(true);
    createOrderMutation.mutate(data);
  };

  // Handle back button click
  const handleBack = () => {
    setLocation(`/services/${serviceId}`);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Loading payment details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">Error loading service details. Please try again.</p>
            <Button className="mt-4 mx-auto block" onClick={handleBack}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Service
      </Button>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Payment Form */}
        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Complete your payment to place your order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Payment Method */}
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="credit_card" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                <div className="flex items-center">
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Credit / Debit Card
                                </div>
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="paypal" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                <div className="flex items-center">
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  PayPal
                                </div>
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="stripe" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                <div className="flex items-center">
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Stripe
                                </div>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Card Details */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input placeholder="1234 5678 9012 3456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/YY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cvc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVC</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="cardholderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cardholder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your billing address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : `Pay ${service.price}$`}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Service</h3>
                  <p>{service.title}</p>
                </div>
                <div>
                  <h3 className="font-medium">Provider</h3>
                  <p>{service.user?.username}</p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">${service.price}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          Note: This is a demo payment page. No actual payment will be processed.
          In a real application, you would integrate with a payment processor like Stripe.
        </p>
        <p className="mt-2">
          The stripe key would need to be added in the server environment variables.
        </p>
      </div>
    </div>
  );
}
