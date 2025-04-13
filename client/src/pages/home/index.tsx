import React from 'react';
import { Link } from '@tanstack/react-router';

export default function HomePage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          WorkiT - Freelancing Platform
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Connect with freelancers and employers worldwide
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/services"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            Explore Services
          </Link>
          <Link
            to="/jobs"
            className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Browse Jobs
          </Link>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          Features
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-medium text-gray-900 tracking-tight">
                  Find Jobs
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Browse and apply to jobs posted by employers worldwide.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-medium text-gray-900 tracking-tight">
                  Offer Services
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Showcase your skills and offer services to clients.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-medium text-gray-900 tracking-tight">
                  Instant Messaging
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Connect with freelancers and employers through our messaging system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
