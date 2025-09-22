import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers, sendNotificationToUser, UserInfo } from "@/services/adminService";
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const Admin = () => {
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  
  // Add debugging to check if the component mounts
  useEffect(() => {
    console.log("Admin component mounted");
    console.log("Current user:", user);
  }, [user]);
  
  const { 
    data: users, 
    isLoading, 
    refetch,
    error: usersError,
    isError
  } = useQuery({
    queryKey: ['allUsers'],
    queryFn: getAllUsers,
    retry: 2,
    retryDelay: 1000,
  });

  // Log the current state for debugging
  useEffect(() => {
    console.log("Query state - users:", users);
    console.log("Query state - isLoading:", isLoading);
    console.log("Query state - isError:", isError);
    console.log("Query state - error:", usersError);
  }, [users, isLoading, isError, usersError]);

  // Handle query success/error with useEffect
  useEffect(() => {
    if (users) {
      console.log("Users loaded successfully:", users);
      if (users.length === 0) {
        toast.warning("No users found in the system.");
      } else {
        toast.success(`Loaded ${users.length} user records`);
      }
    }
  }, [users]);

  useEffect(() => {
    if (isError && usersError) {
      console.error("Error loading users:", usersError);
      toast.error("Failed to load user data. Please check console for details.");
    }
  }, [isError, usersError]);

  const handleSendNotification = async () => {
    if (!selectedUserEmail) {
      toast.error("Please select a user first");
      return;
    }

    if (!notificationMessage.trim()) {
      toast.error("Please enter a notification message");
      return;
    }

    console.log(`Starting to send notification to ${selectedUserEmail}`);
    setIsSending(true);
    try {
      const success = await sendNotificationToUser(selectedUserEmail, notificationMessage);
      if (success) {
        console.log("Notification sent successfully");
        setSelectedUserEmail(""); // Reset selection
        setNotificationMessage(""); // Reset message
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Check for admin access (basic check - should be replaced with proper role-based access control)
  useEffect(() => {
    if (user && !user.email?.includes('admin')) {
      console.log("Non-admin user attempting to access admin page:", user.email);
      // For now, just log - you might want to redirect or show a warning
    }
  }, [user]);

  // Show loading state
  if (isLoading) {
    console.log("Admin page: Showing loading state");
    return (
      <>
        <Header />
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p>Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  console.log("Admin page: Rendering main content");

  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              console.log("Refresh button clicked");
              refetch();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Debug info card */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <p>• Data loading state: {isLoading ? 'Loading...' : 'Complete'}</p>
          <p>• Error state: {isError ? 'Yes' : 'No'}</p>
          <p>• User records found: {users ? users.length : 0}</p>
          <p>• Current user: {user?.email || 'Not logged in'}</p>
        </div>

        {isError && usersError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <h3 className="font-semibold mb-2">Error Details:</h3>
            <p>{usersError.message || 'An unknown error occurred'}</p>
            <p className="mt-2 text-sm">Check the console for more detailed error information.</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Send Notification to User</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">User Email</label>
              <Select value={selectedUserEmail} onValueChange={setSelectedUserEmail}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <SelectItem key={user.user_id} value={user.email}>
                        {user.email}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No users found</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {(!users || users.length === 0) && !isLoading && (
                <p className="text-sm text-red-500 mt-1">
                  No users found. Make sure you have user data in the database.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notification Message</label>
              <Textarea 
                placeholder="Enter your notification message here..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSendNotification}
                disabled={isSending || !selectedUserEmail || !notificationMessage.trim()}
                className="w-full"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Notification
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-lg font-medium p-4 border-b">User Information</h2>
          
          {users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-mono text-xs">{user.user_id.substring(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 px-4">
              <p className="text-gray-500 mb-2">No user data available</p>
              <p className="text-sm text-gray-400 mb-2">
                This could mean:
              </p>
              <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
                <li>No users have signed up yet</li>
                <li>There's an issue with the authentication system</li>
                <li>Admin permissions are not properly configured</li>
              </ul>
              <p className="text-sm text-blue-600 mt-4">
                Try creating a test user account or check your Supabase configuration.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Admin;
