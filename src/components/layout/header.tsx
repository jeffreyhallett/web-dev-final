'use client';

interface HeaderProps {
   view: 'list' | 'map';
   onViewChange: (view: 'list' | 'map') => void;
}

export default function Header({ view, onViewChange }: HeaderProps) {
   return (
      <header className="relative">
         {/* Main header bar - Passport style */}
         <div className="mx-4 mt-4 mb-0">
            <div
               className="relative overflow-hidden rounded-lg"
               style={{
                  background: 'linear-gradient(135deg, #1a2744 0%, #2d3a52 50%, #1a2744 100%)',
                  boxShadow: '0 4px 20px rgba(26, 39, 68, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
               }}
            >
               {/* Gold border accent */}
               <div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                     border: '2px solid transparent',
                     borderImage: 'linear-gradient(135deg, #c9a227, #e8d48b, #c9a227) 1',
                  }}
               />

               {/* Decorative pattern overlay */}
               <div
                  className="absolute inset-0 opacity-5"
                  style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
               />

               <div className="relative px-6 py-4">
                  <div className="flex justify-between items-center">
                     {/* Logo and title */}
                     <div className="flex items-center gap-4">
                        {/* Passport emblem */}
                        <div
                           className="w-12 h-12 rounded-full flex items-center justify-center"
                           style={{
                              background: 'linear-gradient(135deg, #c9a227 0%, #e8d48b 50%, #c9a227 100%)',
                              boxShadow: '0 2px 10px rgba(201, 162, 39, 0.3)',
                           }}
                        >
                           <span className="text-2xl">🌍</span>
                        </div>

                        <div>
                           <h1
                              className="text-2xl font-bold tracking-wide"
                              style={{
                                 color: '#e8d48b',
                                 textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                 fontFamily: 'Georgia, serif',
                                 letterSpacing: '3px',
                              }}
                           >
                              TRAVEL JOURNAL
                           </h1>
                           <p
                              className="text-xs tracking-widest mt-0.5"
                              style={{ color: 'rgba(232, 212, 139, 0.6)' }}
                           >
                              YOUR ADVENTURES AWAIT
                           </p>
                        </div>
                     </div>

                     {/* Decorative stamps */}
                     <div className="hidden md:flex items-center gap-3 mr-6">
                        <div
                           className="px-3 py-1 rounded-sm text-xs font-bold tracking-wider"
                           style={{
                              color: '#c41e3a',
                              border: '2px solid #c41e3a',
                              transform: 'rotate(-8deg)',
                              opacity: 0.7,
                           }}
                        >
                           EXPLORER
                        </div>
                        <div
                           className="px-3 py-1 rounded-sm text-xs font-bold tracking-wider"
                           style={{
                              color: '#2d5a3d',
                              border: '2px solid #2d5a3d',
                              transform: 'rotate(5deg)',
                              opacity: 0.7,
                           }}
                        >
                           WANDERER
                        </div>
                     </div>

                     {/* View toggle */}
                     <div
                        className="flex rounded-lg overflow-hidden"
                        style={{
                           background: 'rgba(0,0,0,0.3)',
                           border: '1px solid rgba(201, 162, 39, 0.3)',
                        }}
                     >
                        <button
                           onClick={() => onViewChange('list')}
                           className="px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2"
                           style={{
                              background: view === 'list' ? 'linear-gradient(135deg, #c9a227, #a88520)' : 'transparent',
                              color: view === 'list' ? '#1a2744' : 'rgba(232, 212, 139, 0.7)',
                           }}
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                           </svg>
                           Journal
                        </button>
                        <button
                           onClick={() => onViewChange('map')}
                           className="px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2"
                           style={{
                              background: view === 'map' ? 'linear-gradient(135deg, #c9a227, #a88520)' : 'transparent',
                              color: view === 'map' ? '#1a2744' : 'rgba(232, 212, 139, 0.7)',
                           }}
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                           </svg>
                           Map
                        </button>
                     </div>
                  </div>
               </div>

               {/* Bottom decorative border */}
               <div
                  className="h-1"
                  style={{
                     background: 'linear-gradient(90deg, transparent, #c9a227 20%, #e8d48b 50%, #c9a227 80%, transparent)',
                  }}
               />
            </div>
         </div>
      </header>
   );
}
