interface headerProps {
   view: 'list' | 'map';
   onViewChange: (view: 'list' | 'map') => void;
}

export default function Header({view, onViewChange}: headerProps) {
   return (
      <header className='mx-4 mt-4 mb-0'>
         <div className='bg-gray-300 rounded-lg shadow-md px-6 py-4'>
            <div className='flex justify-between items-center'>
               <h1 className='text-2xl font-semibold text-gray-800'>Travel Planner</h1>
               <div className='flex gap-2'>
                  <button
                     onClick={() => onViewChange('list')}
                     className={`px-4 py-2 rounded-lg transition-all ${
                        view === 'list'
                           ? 'bg-blue-500 text-white'
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                     }`}>
                     List View
                  </button>
                  <button
                     onClick={() => onViewChange('map')}
                     className={`px-4 py-2 rounded-lg transition-all ${
                        view === 'map'
                           ? 'bg-blue-500 text-white'
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                     }`}>
                     Map View
                  </button>
               </div>
            </div>
         </div>
      </header>
   )
}