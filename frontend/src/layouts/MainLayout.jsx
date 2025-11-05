// src/layouts/MainLayout.jsx

import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      {/* This 'main' tag will contain the actual page content */}
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
