
import { useState } from "react";
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

const Admin = () => {
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [creditAmount, setCreditAmount] = useState(5);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  
  const { 
    data: userCredits, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['userCredits'],
    queryFn: getUserCreditsInfo
  });

  const handleAddCredits = async () => {
    if (!selectedUserEmail) {
      toast.error("Please select a user first");
      return;
    }

    setIsAdding(true);
    try {
      await addUserCredits(selectedUserEmail, creditAmount);
      await refetch(); // Refresh the data after adding credits
      setSelectedUserEmail(""); // Reset selection
      
      // Force reload the admin page to show the updated credits
      navigate(0);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <Header isAuthenticated={true} />
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

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
                        {user.email}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No users found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Credits to Add</label>
              <Input 
                type="number" 
                min={1}
                value={creditAmount}
                onChange={(e) => setCreditAmount(parseInt(e.target.value))}
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
          
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : userCredits && userCredits.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell className="capitalize">{user.subscription_type}</TableCell>
                      <TableCell>{user.monthly_credits}</TableCell>
                      <TableCell>{user.credits_used}</TableCell>
                      <TableCell>{user.remaining_credits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No user data available</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Admin;
