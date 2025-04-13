// ... existing code ... <imports and other code>

import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/ui/use-toast';
import { useNavigate } from '@tanstack/react-router';

// ... existing code ... <component definition>

export default function ServiceDetailPage() {
  const { user, isAuthenticated, isVisitor } = useAuth();
  const { toast } = useToast();
  const setLocation = useNavigate();

  // ... existing code ...

  const handleOrderNow = () => {
    if (isVisitor) {
      setVisitorNotifyMessage({
        title: 'Order Unavailable in Visitor Mode',
        description: 'You need to sign up or log in to order services on WorkiT.'
      });
      setVisitorNotifyOpen(true);
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to order this service.',
        variant: 'destructive',
      });
      setLocation('/auth/login');
      return;
    }

    if (user?.id === service.userId) {
      toast({
        title: 'Cannot Order',
        description: 'You cannot order your own service.',
        variant: 'destructive',
      });
      return;
    }

    // Navigate to payment page with service ID
    setLocation(`/payment?serviceId=${serviceId}`);
  };

  const handleContactFreelancer = () => {
    if (isVisitor) {
      setVisitorNotifyMessage({
        title: 'Messaging Unavailable in Visitor Mode',
        description: 'You need to sign up or log in to message freelancers on WorkiT.'
      });
      setVisitorNotifyOpen(true);
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to contact this freelancer.',
        variant: 'destructive',
      });
      setLocation('/auth/login');
      return;
    }

    if (user?.id === service.userId) {
      toast({
        title: 'Cannot Message',
        description: 'You cannot message yourself.',
        variant: 'destructive',
      });
      return;
    }

    // Navigate to messages with recipient ID
    setLocation(`/messages?recipientId=${service.userId}`);
  };

// ... existing code ... <render function>

  return (
    <div>
      {/* ... existing code ... */}

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <Button onClick={handleOrderNow} className="flex-1">
          Order Now
        </Button>

        <Button
          onClick={handleContactFreelancer}
          variant="outline"
          className="flex-1 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Contact Freelancer
        </Button>
      </div>

      {/* ... existing code ... */}
    </div>
  );
}

// ... existing code ... <rest of the component>
