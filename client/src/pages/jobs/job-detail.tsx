// ... existing code ... <applicationMutation definition>

import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/ui/use-toast';
import { useNavigate } from '@tanstack/react-router';

// ... existing code ... <component definition>

export default function JobDetailPage() {
  const { user, isAuthenticated, isVisitor } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const jobId = useParams({ from: '/jobs/$jobId' }).jobId;

  // ... existing code ... <fetch job data>

  const handleContactEmployer = () => {
    if (isVisitor) {
      setVisitorNotifyMessage({
        title: 'Messaging Unavailable in Visitor Mode',
        description: 'You need to sign up or log in to message employers on WorkiT.'
      });
      setVisitorNotifyOpen(true);
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to contact this employer.',
        variant: 'destructive',
      });
      navigate('/auth/login');
      return;
    }

    if (user?.id === job?.userId) {
      toast({
        title: 'Cannot Message',
        description: 'You cannot message yourself.',
        variant: 'destructive',
      });
      return;
    }

    // Navigate to messages with recipient ID
    navigate(`/messages?recipientId=${job?.userId}`);
  };

  // ... existing code ... <render function>

  return (
    <div>
      {/* ... existing code ... */}

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <Button onClick={() => setApplicationDialogOpen(true)} className="flex-1">
          Apply Now
        </Button>

        <Button
          onClick={handleContactEmployer}
          variant="outline"
          className="flex-1 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Contact Employer
        </Button>
      </div>

      {/* ... existing code ... */}
    </div>
  );
}

const applicationMutation = useMutation({
  mutationFn: async (data: ApplicationFormValues) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('description', data.description);
      if (data.resumeFile) {
        formData.append('resumeFile', data.resumeFile);
      }

      // Make direct fetch call instead of using apiRequest to handle multipart/form-data
      const response = await fetch(`/api/jobs/${jobId}/applications`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }

      return response.json();
    } catch (error: any) {
      console.error('Application submission error:', error);
      throw new Error(error.message || 'An error occurred while submitting your application');
    }
  },
  onSuccess: () => {
    toast({
      title: 'Application Submitted',
      description: 'Your application has been submitted successfully.',
    });
    setApplicationDialogOpen(false);
    form.reset();
    // Refresh job applications data if needed
    queryClient.invalidateQueries({
      queryKey: [`/api/jobs/${jobId}/applications`],
    });
  },
  onError: (error: any) => {
    toast({
      title: 'Application Failed',
      description: error.message || 'Failed to submit application. Please try again.',
      variant: 'destructive',
    });
  },
});

const onApplicationSubmit = (data: ApplicationFormValues) => {
  if (!data.description) {
    toast({
      title: 'Missing Information',
      description: 'Please provide a description for your application.',
      variant: 'destructive',
    });
    return;
  }

  applicationMutation.mutate(data);
};

// ... existing code ... <rest of the component>
