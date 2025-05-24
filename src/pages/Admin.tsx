
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserCreditsInfo, addUserCredits, UserCreditInfo } from "@/services/adminService";
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
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
  const [creditAmount, setCreditAmount] = useState(5);
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Add debugging to check if the component mounts
  useEffect(() => {
    console.log("Admin component mounted");
    console.log("Current user:", user);
  }, [user]);
  
  const { 
    data: userCredits, 
    isLoading, 
    refetch,
    error: userCreditsError,
    isError
  } = useQuery({
    queryKey: ['userCredits'],
    queryFn: getUserCreditsInfo,
    retry: 2,
    retryDelay: 1000,
  });

  // Log the current state for debugging
  useEffect(() => {
    console.log("Query state - userCredits:", userCredits);
    console.log("Query state - isLoading:", isLoading);
    console.log("Query state - isError:", isError);
    console.log("Query state - error:", userCreditsError);
  }, [userCredits, isLoading, isError, userCreditsError]);

  // Handle query success/error with useEffect
  useEffect(() => {
    if (userCredits) {
      console.log("User credits loaded successfully:", userCredits);
      if (userCredits.length === 0) {
        toast.warning("No user credits data found. Make sure the database is properly set up.");
      } else {
        toast.success(`Loaded ${userCredits.length} user records`);
      }
    }
  }, [userCredits]);

  useEffect(() => {
    if (isError && userCreditsError) {
      console.error("Error loading user credits:", userCreditsError);
      toast.error("Failed to load user data. Please check console for details.");
    }
  }, [isError, userCreditsError]);

  const handleAddCredits = async () => {
    if (!selectedUserEmail) {
      toast.error("Please select a user first");
      return;
    }

    console.log(`Starting to add ${creditAmount} credits to ${selectedUserEmail}`);
    setIsAdding(true);
    try {
      const success = await addUserCredits(selectedUserEmail, creditAmount);
      if (success) {
        console.log("Credits added successfully, refreshing data...");
        await refetch(); // Refresh the data after adding credits
        setSelectedUserEmail(""); // Reset selection
        setCreditAmount(5); // Reset credit amount
      }
    } catch (error) {
      console.error("Error adding credits:", error);
      toast.error("Failed to add credits. Please try again.");
    } finally {
      setIsAdding(false);
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
        <Header isAuthenticated={true} />
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
      <Header isAuthenticated={true} />
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
          <p>• User records found: {userCredits ? userCredits.length : 0}</p>
          <p>• Current user: {user?.email || 'Not logged in'}</p>
        </div>

        {isError && userCreditsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <h3 className="font-semibold mb-2">Error Details:</h3>
            <p>{userCreditsError.message || 'An unknown error occurred'}</p>
            <p className="mt-2 text-sm">Check the console for more detailed error information.</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Add Credits to User</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">User Email</label>
              <Select value={selectedUserEmail} onValueChange={setSelectedUserEmail}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {userCredits && userCredits.length > 0 ? (
                    userCredits.map((user) => (
                      <SelectItem key={user.user_id} value={user.email}>
                        {user.email} ({user.subscription_type})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No users found</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {(!userCredits || userCredits.length === 0) && !isLoading && (
                <p className="text-sm text-red-500 mt-1">
                  No users found. Make sure you have user data in the database.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Credits to Add</label>
              <Input 
                type="number" 
                min={1}
                value={creditAmount}
                onChange={(e) => setCreditAmount(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddCredits}
                disabled={isAdding || !selectedUserEmail}
                className="w-full"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Credits
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-lg font-medium p-4 border-b">User Credits Information</h2>
          
          {userCredits && userCredits.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Monthly Credits</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userCredits.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-mono text-xs">{user.user_id.substring(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell className="capitalize">{user.subscription_type}</TableCell>
                      <TableCell>{user.monthly_credits}</TableCell>
                      <TableCell>{user.credits_used}</TableCell>
                      <TableCell className={user.remaining_credits <= 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                        {user.remaining_credits}
                      </TableCell>
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
                <li>The admin_user_credits view doesn't exist in your database</li>
                <li>Users exist but don't have subscription records</li>
              </ul>
              <p className="text-sm text-blue-600 mt-4">
                Try creating a test user account or check your Supabase database configuration.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Admin;
