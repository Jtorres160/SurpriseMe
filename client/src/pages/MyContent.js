import React from 'react';

const MyContent = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="card-body">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">My Content</h1>
            <p className="text-gray-600">
              This page will show all content uploaded by the user with management options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyContent; 