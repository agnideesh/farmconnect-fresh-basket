
import React from 'react';
import MovieNavbar from '@/components/Layout/MovieNavbar';
import Footer from '@/components/Layout/Footer';

const MovieView: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MovieNavbar />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-10">
        <h1 className="text-3xl font-bold text-primary mb-6">Movie Collection</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Placeholder for movie cards */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div 
              key={item}
              className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[2/3] bg-accent/20"></div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">Movie Title {item}</h3>
                <p className="text-sm text-muted-foreground">2023 • Action, Drama</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MovieView;
