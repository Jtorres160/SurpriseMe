import React from 'react';
import { useParams } from 'react-router-dom';

const ContentDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="card-body">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Content Detail</h1>
            <p className="text-gray-600">Content ID: {id}</p>
            <p className="text-gray-600 mt-4">
              This page will show the detailed view of content with purchase functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail; 