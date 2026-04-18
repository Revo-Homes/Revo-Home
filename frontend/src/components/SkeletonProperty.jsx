function SkeletonProperty() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[4/3] bg-gray-200" />
      
      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-24 bg-gray-200 rounded-lg" />
          <div className="h-4 w-16 bg-gray-200 rounded-lg" />
        </div>
        
        <div className="space-y-2">
          <div className="h-5 w-full bg-gray-200 rounded-lg" />
          <div className="h-4 w-2/3 bg-gray-200 rounded-lg" />
        </div>
        
        <div className="flex gap-4">
          <div className="h-4 w-12 bg-gray-200 rounded-lg" />
          <div className="h-4 w-12 bg-gray-200 rounded-lg" />
          <div className="h-4 w-12 bg-gray-200 rounded-lg" />
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          <div className="h-10 w-full bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonProperty;
