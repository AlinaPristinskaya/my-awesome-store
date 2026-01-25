export default function Loading() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок-скелетон */}
        <div className="h-16 w-64 bg-gray-100 animate-pulse rounded-2xl mx-auto mb-16" />
        
        {/* Сетка скелетонов */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="aspect-4/5 w-full bg-gray-50 animate-pulse rounded-4xl mb-6" />
              <div className="h-6 w-3/4 bg-gray-50 animate-pulse rounded-lg mb-2" />
              <div className="h-4 w-1/2 bg-gray-50 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}