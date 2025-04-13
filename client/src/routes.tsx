import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import HomePage from './pages/home';
import ServiceDetailPage from './pages/services/service-detail';
import JobDetailPage from './pages/jobs/job-detail';
import PaymentPage from './pages/payment';
import MessagesPage from './pages/messages';
import ConversationDetailPage from './pages/messages/[conversationId]';

// Define routes
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  ),
});

// Home route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

// Service routes
const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'services',
  component: () => <Outlet />,
});

const serviceDetailRoute = createRoute({
  getParentRoute: () => servicesRoute,
  path: '$serviceId',
  component: ServiceDetailPage,
});

// Job routes
const jobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'jobs',
  component: () => <Outlet />,
});

const jobDetailRoute = createRoute({
  getParentRoute: () => jobsRoute,
  path: '$jobId',
  component: JobDetailPage,
});

// Payment route
const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'payment',
  component: PaymentPage,
});

// Messages routes
const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'messages',
  component: MessagesPage,
});

const messageDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'messages/$conversationId',
  component: ConversationDetailPage,
});

// Create and export router
const routeTree = rootRoute.addChildren([
  indexRoute,
  servicesRoute.addChildren([serviceDetailRoute]),
  jobsRoute.addChildren([jobDetailRoute]),
  paymentRoute,
  messagesRoute,
  messageDetailRoute,
]);

export const router = createRouter({ routeTree });

// Register router types
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
