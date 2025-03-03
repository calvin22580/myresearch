export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h1 className="text-2xl font-bold mb-4">My-Research.ai Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome to your research assistant</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-medium mb-2">Recent Conversations</h2>
          <p className="text-sm text-muted-foreground">You have no conversations yet. Start a new one!</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-medium mb-2">Available Credits</h2>
          <p className="text-sm text-muted-foreground">You have 100 credits remaining.</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-medium mb-2">Recent Documents</h2>
          <p className="text-sm text-muted-foreground">No recent documents found.</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-medium mb-2">Account Status</h2>
          <p className="text-sm text-muted-foreground">Free tier account</p>
        </div>
      </div>
    </div>
  );
} 