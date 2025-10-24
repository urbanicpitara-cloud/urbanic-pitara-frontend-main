import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useApiError() {
  const router = useRouter();

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      // Handle authentication errors
      if (error.message === 'Authentication required' || error.message === 'Invalid or expired token') {
        toast.error('Please login to continue');
        router.push('/auth');
        return;
      }

      // Handle forbidden errors
      if (error.message === 'Admin access required') {
        toast.error('You do not have permission to perform this action');
        router.push('/');
        return;
      }

      // Handle other errors
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred');
    }
  };

  return { handleError };
}