
import React from 'react';
import { BookOpen } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between border-b">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-audiobook-primary" />
        <h1 className="text-xl font-bold text-gray-800">Audio<span className="text-audiobook-primary">Scribe</span></h1>
      </div>
      <div className="text-sm text-gray-500">
        Transforme PDFs em audiobooks
      </div>
    </header>
  );
};

export default Header;
