
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getWallet, getTransactions } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  BadgeIndianRupee,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PAYMENT_METHODS = [
  { id: 'upi', name: 'UPI' },
  { id: 'card', name: 'Credit/Debit Card' },
  { id: 'netbanking', name: 'Net Banking' },
  { id: 'paytm', name: 'Paytm' },
  { id: 'phonepe', name: 'PhonePe' },
  { id: 'gpay', name: 'Google Pay' },
];

const WalletPage = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addAmount, setAddAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const walletData = await getWallet(user.id);
        setWallet(walletData);
        
        if (walletData) {
          const transactionsData = await getTransactions(walletData.id);
          setTransactions(transactionsData);
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        toast.error('Failed to load wallet');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [user]);

  const handleAddMoney = async () => {
    if (!addAmount || !selectedPaymentMethod) {
      toast.error('Please enter an amount and select a payment method');
      return;
    }
    
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would integrate with a payment gateway here
      
      toast.success(`Added ₹${amount.toFixed(2)} to your wallet`);
      
      // Update wallet balance (in a real app, this would happen server-side)
      setWallet(prev => ({
        ...prev,
        balance: prev.balance + amount
      }));
      
      // Add transaction to list (in a real app, this would come from the server)
      const newTransaction = {
        id: `tr_${Date.now()}`,
        amount: amount,
        type: 'deposit',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: `Added money via ${PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name}`
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Reset form
      setAddAmount('');
      setSelectedPaymentMethod('');
    } catch (error) {
      console.error('Error adding money:', error);
      toast.error('Failed to add money');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) {
      toast.error('Please enter an amount');
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (wallet && amount > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Simulate withdrawal processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would process the withdrawal here
      
      toast.success(`Withdrawal of ₹${amount.toFixed(2)} initiated`);
      
      // Update wallet balance (in a real app, this would happen server-side)
      setWallet(prev => ({
        ...prev,
        balance: prev.balance - amount
      }));
      
      // Add transaction to list (in a real app, this would come from the server)
      const newTransaction = {
        id: `tr_${Date.now()}`,
        amount: amount,
        type: 'withdrawal',
        status: 'pending',
        created_at: new Date().toISOString(),
        description: 'Withdrawal to bank account'
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Reset form
      setWithdrawAmount('');
    } catch (error) {
      console.error('Error withdrawing money:', error);
      toast.error('Failed to process withdrawal');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    }
    
    if (status === 'failed') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-5 w-5 text-blue-500" />;
      case 'ad_revenue':
        return <BadgeIndianRupee className="h-5 w-5 text-green-500" />;
      case 'premium_subscription':
        return <CreditCard className="h-5 w-5 text-purple-500" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        
        <Skeleton className="h-12 w-full" />
        
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Wallet not found</h2>
          <p className="text-muted-foreground mt-2">We couldn't find your wallet. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold">Wallet</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{wallet.balance.toFixed(2)}</div>
          </CardContent>
          <CardFooter>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Add Money</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Money to Wallet</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to add to your wallet.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select
                      value={selectedPaymentMethod}
                      onValueChange={setSelectedPaymentMethod}
                    >
                      <SelectTrigger id="payment-method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map(method => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddMoney} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Add Money'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{transactions
                .filter(t => t.type === 'ad_revenue' && t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </div>
          </CardContent>
          <CardFooter>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Withdraw</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Money</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to withdraw to your bank account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Amount (₹)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  {!wallet.is_kyc_verified && (
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm">
                      KYC verification is required for withdrawals. Please complete your KYC.
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleWithdraw} 
                    disabled={isProcessing || !wallet.is_kyc_verified}
                  >
                    {isProcessing ? 'Processing...' : 'Withdraw'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">KYC Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {wallet.is_kyc_verified ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-medium">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-lg font-medium">Not Verified</span>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant={wallet.is_kyc_verified ? "outline" : "default"} 
              className="w-full"
              disabled={wallet.is_kyc_verified}
            >
              {wallet.is_kyc_verified ? 'KYC Completed' : 'Complete KYC'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <TransactionsList 
            transactions={transactions} 
            formatDate={formatDate} 
            getTransactionIcon={getTransactionIcon} 
          />
        </TabsContent>
        
        <TabsContent value="deposits" className="mt-6">
          <TransactionsList 
            transactions={transactions.filter(t => t.type === 'deposit')} 
            formatDate={formatDate} 
            getTransactionIcon={getTransactionIcon} 
          />
        </TabsContent>
        
        <TabsContent value="withdrawals" className="mt-6">
          <TransactionsList 
            transactions={transactions.filter(t => t.type === 'withdrawal')} 
            formatDate={formatDate} 
            getTransactionIcon={getTransactionIcon} 
          />
        </TabsContent>
        
        <TabsContent value="earnings" className="mt-6">
          <TransactionsList 
            transactions={transactions.filter(t => t.type === 'ad_revenue')} 
            formatDate={formatDate} 
            getTransactionIcon={getTransactionIcon} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface TransactionsListProps {
  transactions: any[];
  formatDate: (date: string) => string;
  getTransactionIcon: (type: string, status: string) => JSX.Element;
}

const TransactionsList: React.FC<TransactionsListProps> = ({ 
  transactions, 
  formatDate, 
  getTransactionIcon 
}) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No transactions</h3>
        <p className="text-muted-foreground mt-2">You haven't made any transactions yet.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {transactions.map(transaction => (
        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              {getTransactionIcon(transaction.type, transaction.status)}
            </div>
            <div>
              <h3 className="font-medium">{transaction.description || 'Transaction'}</h3>
              <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-medium ${
              transaction.type === 'withdrawal' ? 'text-blue-600' : 
              transaction.type === 'deposit' || transaction.type === 'ad_revenue' ? 'text-green-600' : ''
            }`}>
              {transaction.type === 'withdrawal' ? '-' : '+'}₹{transaction.amount.toFixed(2)}
            </p>
            <p className={`text-xs ${
              transaction.status === 'completed' ? 'text-green-600' : 
              transaction.status === 'pending' ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WalletPage;