import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, DollarSign, Phone, BarChart3, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CallData {
  id: string;
  CID_num: string;
  DID_num: string;
  start: string;
  duration: number;
  did_seller: string | null;
  did_lead_price: string | null;
  conversion_revenue: string | null;
  lastStatus: string | null;
}

interface ExpandedProvider {
  [key: string]: boolean;
}

export default function LeadAnalytics() {
  const [callData, setCallData] = useState<CallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState<"yesterday" | "today" | "7days" | "30days" | "custom">("yesterday");
  const yesterday = subDays(new Date(), 1);
  const [startDate, setStartDate] = useState<Date>(startOfDay(yesterday));
  const [endDate, setEndDate] = useState<Date>(endOfDay(yesterday));
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [sortField, setSortField] = useState<keyof typeof providerStats[0]>("roi");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedProviders, setExpandedProviders] = useState<ExpandedProvider>({});
  const [conversionHeatmapExpanded, setConversionHeatmapExpanded] = useState(false);
  const [roiHeatmapExpanded, setRoiHeatmapExpanded] = useState(false);
  const [overallRoiExpanded, setOverallRoiExpanded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      navigate('/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    // Load Font Awesome
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    // Set date range based on selection
    const now = new Date();
    const yesterday = subDays(now, 1);
    switch (dateRange) {
      case "yesterday":
        setStartDate(startOfDay(yesterday));
        setEndDate(endOfDay(yesterday));
        break;
      case "today":
        setStartDate(startOfDay(now));
        setEndDate(endOfDay(now));
        break;
      case "7days":
        setStartDate(startOfDay(subDays(now, 7)));
        setEndDate(endOfDay(now));
        break;
      case "30days":
        setStartDate(startOfDay(subDays(now, 30)));
        setEndDate(endOfDay(now));
        break;
    }
  }, [dateRange]);

  useEffect(() => {
    fetchCallData();
  }, [startDate, endDate]);

  const fetchCallData = async () => {
    try {
      setLoading(true);
      
      // Fetch ONLY from calls_with_did table - no joins needed
      const { data: callsData, error: callsError } = await supabase
        .from("calls_with_did")
        .select("id, CID_num, DID_num, start, duration, did_seller, did_lead_price, conversion_revenue, lastStatus")
        .gte("start", startDate.toISOString())
        .lte("start", endDate.toISOString())
        .order("start", { ascending: false });

      if (callsError) throw callsError;

      setCallData(callsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter data
  const filteredData = callData.filter((call) => {
    if (selectedProvider !== "all" && call.did_seller !== selectedProvider) return false;
    if (phoneSearch && !call.CID_num?.includes(phoneSearch)) return false;
    return true;
  });

  // Get unique providers
  const providers = [...new Set(callData.map((c) => c.did_seller).filter(Boolean))].sort();

  // Calculate metrics
  const totalCalls = filteredData.length;
  const callsOver120s = filteredData.filter((c) => c.duration > 120).length;
  const callsUnder120s = totalCalls - callsOver120s;
  
  // Calculate total cost (only for calls > 120s)
  const totalCost = filteredData.reduce((sum, call) => {
    if (call.duration > 120 && call.did_lead_price) {
      const priceStr = call.did_lead_price.replace(/[$,]/g, '');
      const price = parseFloat(priceStr);
      return sum + (isNaN(price) ? 0 : price);
    }
    return sum;
  }, 0);

  // Calculate total revenue from conversion_revenue column in calls_with_did
  // Deduplicate by phone number - count each unique conversion only once
  const revenueByPhone = filteredData.reduce((acc, call) => {
    if (call.conversion_revenue && call.CID_num) {
      const revenueStr = call.conversion_revenue.replace(/[$,]/g, '');
      const revenue = parseFloat(revenueStr);
      if (!isNaN(revenue) && revenue > 0) {
        // Only count this revenue if we haven't seen this phone number yet
        if (!acc[call.CID_num]) {
          acc[call.CID_num] = revenue;
        }
      }
    }
    return acc;
  }, {} as Record<string, number>);
  
  const totalRevenue = Object.values(revenueByPhone).reduce((sum, revenue) => sum + revenue, 0);

  // Calculate ROI
  const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost * 100) : 0;

  // Calculate conversion rates (based on conversion_revenue field in calls_with_did)
  // Deduplicate by phone number - count unique conversions only
  const uniqueConversions = new Set(
    filteredData
      .filter((c) => {
        if (!c.conversion_revenue || !c.CID_num) return false;
        const revenue = parseFloat(c.conversion_revenue.replace(/[$,]/g, ''));
        return !isNaN(revenue) && revenue > 0;
      })
      .map((c) => c.CID_num)
  );
  const callsWithConversion = uniqueConversions.size;
  const overallConversionRate = totalCalls > 0 ? (callsWithConversion / totalCalls * 100) : 0;
  
  const callsOver2Min = filteredData.filter((c) => c.duration > 120).length;
  
  // Count unique conversions for calls over 2 min (deduplicate by phone number)
  const uniqueConversionsOver2Min = new Set(
    filteredData
      .filter((c) => {
        if (c.duration <= 120) return false;
        if (!c.conversion_revenue || !c.CID_num) return false;
        const revenue = parseFloat(c.conversion_revenue.replace(/[$,]/g, ''));
        return !isNaN(revenue) && revenue > 0;
      })
      .map((c) => c.CID_num)
  );
  const conversionsOver2Min = uniqueConversionsOver2Min.size;
  const conversionRateOver2Min = callsOver2Min > 0 ? (conversionsOver2Min / callsOver2Min * 100) : 0;

  // Calculate average calls per day
  const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const avgCallsPerDay = totalCalls / daysDiff;

  // Calls by day
  const callsByDay = filteredData.reduce((acc, call) => {
    const day = format(new Date(call.start), "MMM dd");
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const callsByDayData = Object.entries(callsByDay)
    .sort(([dayA], [dayB]) => {
      const dateA = new Date(dayA + " 2025");
      const dateB = new Date(dayB + " 2025");
      return dateA.getTime() - dateB.getTime();
    })
    .map(([day, count]) => ({
      day,
      calls: count,
    }));

  // Conversions by day (based on conversion_revenue in calls_with_did)
  // Deduplicate by phone number per day
  const conversionsByDay = filteredData.reduce((acc, call) => {
    if (!call.conversion_revenue || !call.CID_num) return acc;
    const revenue = parseFloat(call.conversion_revenue.replace(/[$,]/g, ''));
    if (isNaN(revenue) || revenue <= 0) return acc;
    
    const day = format(new Date(call.start), "MMM dd");
    if (!acc[day]) {
      acc[day] = new Set<string>();
    }
    acc[day].add(call.CID_num);
    return acc;
  }, {} as Record<string, Set<string>>);

  const conversionsByDayData = Object.entries(conversionsByDay)
    .sort(([dayA], [dayB]) => {
      const dateA = new Date(dayA + " 2025");
      const dateB = new Date(dayB + " 2025");
      return dateA.getTime() - dateB.getTime();
    })
    .map(([day, phoneSet]) => ({
      day,
      conversions: phoneSet.size,
    }));

  // Conversion rate over 2 min by day
  const conversionRateOver2MinByDay = filteredData.reduce((acc, call) => {
    const day = format(new Date(call.start), "MMM dd");
    if (!acc[day]) {
      acc[day] = { callsOver2Min: 0, conversionsOver2Min: new Set<string>() };
    }
    
    if (call.duration > 120) {
      acc[day].callsOver2Min += 1;
      
      if (call.conversion_revenue && call.CID_num) {
        const revenue = parseFloat(call.conversion_revenue.replace(/[$,]/g, ''));
        if (!isNaN(revenue) && revenue > 0) {
          acc[day].conversionsOver2Min.add(call.CID_num);
        }
      }
    }
    
    return acc;
  }, {} as Record<string, { callsOver2Min: number; conversionsOver2Min: Set<string> }>);

  const conversionRateOver2MinByDayData = Object.entries(conversionRateOver2MinByDay)
    .sort(([dayA], [dayB]) => {
      const dateA = new Date(dayA + " 2025");
      const dateB = new Date(dayB + " 2025");
      return dateA.getTime() - dateB.getTime();
    })
    .map(([day, data]) => ({
      day,
      conversionRate: data.callsOver2Min > 0 ? (data.conversionsOver2Min.size / data.callsOver2Min * 100) : 0,
    }));

  // Call duration distribution by day
  const durationByDay = filteredData.reduce((acc, call) => {
    const day = format(new Date(call.start), "MMM dd");
    if (!acc[day]) {
      acc[day] = { day, under2min: 0, over2min: 0 };
    }
    if (call.duration > 120) {
      acc[day].over2min += 1;
    } else {
      acc[day].under2min += 1;
    }
    return acc;
  }, {} as Record<string, { day: string; under2min: number; over2min: number }>);

  const durationByDayData = Object.values(durationByDay);

  // Duration distribution
  const durationDistribution = [
    { name: "Under 2 min", value: callsUnder120s, color: "#7c3aed" },
    { name: "Over 2 min", value: callsOver120s, color: "#581c87" },
  ];

  // Provider distribution for calls over 2 min
  const providerDistributionOver2Min = providers.map((provider) => {
    const providerCallsOver2Min = filteredData.filter((c) => c.did_seller === provider && c.duration > 120).length;
    return {
      name: provider || "Unknown",
      value: providerCallsOver2Min,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    };
  }).filter(p => p.value > 0);

  // Provider analytics
  const providerStats = providers.map((provider) => {
    const providerCalls = filteredData.filter((c) => c.did_seller === provider);
    const providerCallsOver120 = providerCalls.filter((c) => c.duration > 120);
    
    // Calculate cost per call (each call over 120s has its own price)
    const cost = providerCalls.reduce((sum, call) => {
      if (call.duration > 120 && call.did_lead_price) {
        const priceStr = call.did_lead_price.replace(/[$,]/g, '');
        const price = parseFloat(priceStr);
        return sum + (isNaN(price) ? 0 : price);
      }
      return sum;
    }, 0);

    // Calculate revenue per provider - deduplicate by phone number
    const providerRevenueByPhone = providerCalls.reduce((acc, call) => {
      if (call.conversion_revenue && call.CID_num) {
        const revenueStr = call.conversion_revenue.replace(/[$,]/g, '');
        const rev = parseFloat(revenueStr);
        if (!isNaN(rev) && rev > 0) {
          // Only count this revenue if we haven't seen this phone number yet for this provider
          if (!acc[call.CID_num]) {
            acc[call.CID_num] = rev;
          }
        }
      }
      return acc;
    }, {} as Record<string, number>);
    
    const revenue = Object.values(providerRevenueByPhone).reduce((sum, rev) => sum + rev, 0);

    const providerROI = cost > 0 ? ((revenue - cost) / cost * 100) : 0;

    return {
      provider: provider || "Unknown",
      totalCalls: providerCalls.length,
      paidCalls: providerCallsOver120.length,
      cost: cost,
      revenue: revenue,
      roi: providerROI,
      profit: revenue - cost,
    };
  });

  // Sort provider stats
  const sortedProviderStats = [...providerStats].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortDirection === "asc" ? 1 : -1;
    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * modifier;
    }
    return String(aValue).localeCompare(String(bValue)) * modifier;
  });

  // Provider heatmap data - calls distribution by provider and day
  const providerHeatmap = providers.map((provider) => {
    const providerData = filteredData.filter((c) => c.did_seller === provider);
    const byDay = providerData.reduce((acc, call) => {
      const day = format(new Date(call.start), "MMM dd");
      if (!acc[day]) {
        acc[day] = { under2min: 0, over2min: 0 };
      }
      if (call.duration > 120) {
        acc[day].over2min += 1;
      } else {
        acc[day].under2min += 1;
      }
      return acc;
    }, {} as Record<string, { under2min: number; over2min: number }>);

    return {
      provider: provider || "Unknown",
      byDay,
    };
  });

  // Spending by day per provider
  const spendingByDay = filteredData.reduce((acc, call) => {
    if (call.duration > 120 && call.did_lead_price && call.did_seller) {
      const day = format(new Date(call.start), "MMM dd");
      if (!acc[day]) acc[day] = {};
      const price = parseFloat(call.did_lead_price);
      acc[day][call.did_seller] = (acc[day][call.did_seller] || 0) + (isNaN(price) ? 0 : price);
    }
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const handleSort = (field: keyof typeof providerStats[0]) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const toggleProviderExpand = (provider: string) => {
    setExpandedProviders(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div style={{ padding: '20px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{
        width: sidebarCollapsed ? '60px' : '240px',
        backgroundColor: 'white',
        borderRight: '1px solid #eaeaea',
        padding: '25px 0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 20px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        position: 'relative',
        zIndex: 10,
        textAlign: 'left',
        boxSizing: 'border-box'
      }}>
        {/* Logo */}
        <div className="logo" style={{
          padding: sidebarCollapsed ? '25px 0 25px 0' : '0 25px 25px',
          borderBottom: '1px solid #eaeaea',
          marginBottom: '25px',
          display: 'flex',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{
            fontSize: '28px', 
            fontWeight: 700,
            opacity: sidebarCollapsed ? 0 : 1,
            visibility: sidebarCollapsed ? 'hidden' : 'visible'
          }}>
            <span style={{ color: '#00c2cb' }}>Apo</span>
            <span style={{ color: '#4f46e5' }}>Lead</span>
          </h1>
          <div 
            onClick={toggleSidebar}
            style={{
              cursor: 'pointer',
              fontSize: '12px',
              color: '#64748b',
            }}
          >
            <i className={`fas fa-angle-${sidebarCollapsed ? 'right' : 'left'}`}></i>
          </div>
        </div>
        
        {/* Nav Menu */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          padding: sidebarCollapsed ? 0 : '0 15px',
        }}>
          <a href="/supervisor" className="nav-item" style={{
            display: 'flex',
            alignItems: 'center',
            padding: sidebarCollapsed ? '12px 0' : '12px 20px',
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '8px',
            borderRadius: '10px',
            width: '100%',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}>
            <i className="fas fa-chart-pie" style={{ marginRight: sidebarCollapsed ? 0 : '12px' }}></i>
            {!sidebarCollapsed && <span>Dashboard</span>}
          </a>
          
          <a href="/supervisor" className="nav-item" style={{
            display: 'flex',
            alignItems: 'center',
            padding: sidebarCollapsed ? '12px 0' : '12px 20px',
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '8px',
            borderRadius: '10px',
            width: '100%',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}>
            <i className="fas fa-user-friends" style={{ marginRight: sidebarCollapsed ? 0 : '12px' }}></i>
            {!sidebarCollapsed && <span>Interview</span>}
          </a>
          
          <a href="#" className="nav-item" style={{
            display: 'flex',
            alignItems: 'center',
            padding: sidebarCollapsed ? '12px 0' : '12px 20px',
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '8px',
            borderRadius: '10px',
            width: '100%',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}>
            <i className="fas fa-users" style={{ marginRight: sidebarCollapsed ? 0 : '12px' }}></i>
            {!sidebarCollapsed && <span>Agent Roster</span>}
          </a>
          
          <a href="#" className="nav-item" style={{
            display: 'flex',
            alignItems: 'center',
            padding: sidebarCollapsed ? '12px 0' : '12px 20px',
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '8px',
            borderRadius: '10px',
            width: '100%',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}>
            <i className="fas fa-tools" style={{ marginRight: sidebarCollapsed ? 0 : '12px' }}></i>
            {!sidebarCollapsed && <span>Tool Page</span>}
          </a>
          
          <a href="/did-list" className="nav-item" style={{
            display: 'flex',
            alignItems: 'center',
            padding: sidebarCollapsed ? '12px 0' : '12px 20px',
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '8px',
            borderRadius: '10px',
            width: '100%',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}>
            <i className="fas fa-phone" style={{ marginRight: sidebarCollapsed ? 0 : '12px' }}></i>
            {!sidebarCollapsed && <span>DID List</span>}
          </a>

          <a href="/lead-analytics" className="nav-item active" style={{
            display: 'flex',
            alignItems: 'center',
            padding: sidebarCollapsed ? '12px 0' : '12px 20px',
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '8px',
            borderRadius: '10px',
            width: '100%',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            fontWeight: 500,
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}>
            <i className="fas fa-chart-line" style={{ marginRight: sidebarCollapsed ? 0 : '12px' }}></i>
            {!sidebarCollapsed && <span>Lead Analytics</span>}
          </a>
          
          <a href="#" className="nav-item" style={{
            display: 'flex',
            alignItems: 'center',
            padding: sidebarCollapsed ? '12px 0' : '12px 20px',
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '8px',
            borderRadius: '10px',
            width: '100%',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}>
            <i className="fas fa-money-bill-wave" style={{ marginRight: sidebarCollapsed ? 0 : '12px' }}></i>
            {!sidebarCollapsed && <span>Payment History</span>}
          </a>
          
          <div style={{ height: '1px', backgroundColor: '#eaeaea', margin: '15px 10px' }}></div>
          
          <a href="#" className="nav-item" style={{
            display: 'flex',
            alignItems: 'center',
            padding: sidebarCollapsed ? '12px 0' : '12px 20px',
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '8px',
            borderRadius: '10px',
            width: '100%',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}>
            <i className="fas fa-cog" style={{ marginRight: sidebarCollapsed ? 0 : '12px' }}></i>
            {!sidebarCollapsed && <span>Settings</span>}
          </a>
          
          <a 
            href="#" 
            className="nav-item" 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: sidebarCollapsed ? '12px 0' : '12px 20px',
              color: '#64748b',
              textDecoration: 'none',
              marginBottom: '8px',
              borderRadius: '10px',
              width: '100%',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            }}
          >
            <i className="fas fa-sign-out-alt" style={{ marginRight: sidebarCollapsed ? 0 : '12px' }}></i>
            {!sidebarCollapsed && <span>Log Out</span>}
          </a>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px 30px', overflow: 'auto' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Lead Analytics</h1>
          <p className="text-muted-foreground">
            Analyze lead quality, provider performance, and ROI metrics
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === "custom" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(startDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(startOfDay(date))}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(endDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => date && setEndDate(endOfDay(date))}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Provider</label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {providers.map((provider) => (
                      <SelectItem key={provider} value={provider!}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Search Phone</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by phone..."
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium">Total Calls</CardTitle>
              <Phone className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold">{totalCalls}</div>
              <p className="text-[10px] text-muted-foreground">
                Avg {avgCallsPerDay.toFixed(1)}/day
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium">Revenue</CardTitle>
              <DollarSign className="h-3 w-3 text-green-600" />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
              <p className="text-[10px] text-muted-foreground">
                {callsWithConversion} conversions
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium">Cost</CardTitle>
              <DollarSign className="h-3 w-3 text-red-600" />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold text-red-600">${totalCost.toFixed(2)}</div>
              <p className="text-[10px] text-muted-foreground">
                {callsOver120s} paid ({'>'}2min)
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium">ROI</CardTitle>
              {roi >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className={`text-xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {roi.toFixed(1)}%
              </div>
              <p className="text-[10px] text-muted-foreground">
                Profit: ${(totalRevenue - totalCost).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Conversion Rate</CardTitle>
              <CardDescription>All calls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{overallConversionRate.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground mt-2">
                {callsWithConversion} conversions out of {totalCalls} total calls
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate ({'>'}2min)</CardTitle>
              <CardDescription>Calls over 2 minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{conversionRateOver2Min.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground mt-2">
                {conversionsOver2Min} conversions out of {callsOver2Min} calls over 2 min
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Calls by Day</CardTitle>
              <CardDescription>Daily call volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={callsByDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="calls" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Provider Distribution (Calls {'>'}2 min)</CardTitle>
              <CardDescription>Distribution of paid calls by provider</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={providerDistributionOver2Min}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {providerDistributionOver2Min.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversions by Day</CardTitle>
              <CardDescription>Daily conversion volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversionsByDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="conversions" stroke="#7c3aed" strokeWidth={3} dot={{ fill: "#581c87", r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate Over 2 Min by Day</CardTitle>
              <CardDescription>Daily conversion rate for calls over 2 minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversionRateOver2MinByDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                  <Line type="monotone" dataKey="conversionRate" stroke="#22c55e" strokeWidth={3} dot={{ fill: "#16a34a", r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Duration Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Call Duration Split by Day</CardTitle>
              <CardDescription>Under vs over 2 minutes per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={durationByDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="under2min" stackId="a" fill="#c084fc" name="Under 2 min" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="over2min" stackId="a" fill="#581c87" name="Over 2 min" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Call Duration Distribution</CardTitle>
              <CardDescription>Overall split</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={durationDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {durationDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Provider Heatmap */}
        <Card className="mb-6">
          <CardHeader className="cursor-pointer" onClick={() => setConversionHeatmapExpanded(!conversionHeatmapExpanded)}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Provider Performance Heatmap</CardTitle>
                <CardDescription>Conversion rate % by provider and day (Blue = High, Purple = Low)</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                {conversionHeatmapExpanded ? '▼' : '▶'}
              </Button>
            </div>
          </CardHeader>
          {conversionHeatmapExpanded && (
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* Header Row - Days */}
                <div className="flex mb-2">
                  <div className="w-32 flex-shrink-0"></div>
                  {Array.from(new Set(filteredData.map(c => format(new Date(c.start), "MMM dd"))))
                    .sort((a, b) => {
                      const dateA = new Date(a + " 2025");
                      const dateB = new Date(b + " 2025");
                      return dateA.getTime() - dateB.getTime();
                    })
                    .map((day) => (
                      <div key={day} className="w-20 text-center text-xs font-medium px-1">
                        {day}
                      </div>
                    ))}
                </div>
                
                {/* Provider Rows */}
                {providerHeatmap.map((provider) => {
                  const allDays = Array.from(new Set(filteredData.map(c => format(new Date(c.start), "MMM dd"))))
                    .sort((a, b) => {
                      const dateA = new Date(a + " 2025");
                      const dateB = new Date(b + " 2025");
                      return dateA.getTime() - dateB.getTime();
                    });
                  
                  return (
                    <div key={provider.provider} className="flex mb-1">
                      <div className="w-32 flex-shrink-0 text-sm font-medium pr-2 flex items-center">
                        {provider.provider}
                      </div>
                      {allDays.map((day) => {
                        const data = provider.byDay[day] || { under2min: 0, over2min: 0 };
                        const total = data.under2min + data.over2min;
                        
                        // Calculate conversion rate for calls OVER 2 minutes only
                        const providerDayCalls = filteredData.filter(c => 
                          c.did_seller === provider.provider && 
                          format(new Date(c.start), "MMM dd") === day
                        );
                        const callsOver2Min = providerDayCalls.filter(c => c.duration > 120).length;
                        const conversionsOver2Min = providerDayCalls.filter(c => {
                          if (c.duration <= 120) return false;
                          if (!c.conversion_revenue) return false;
                          const revenue = parseFloat(c.conversion_revenue.replace(/[$,]/g, ''));
                          return !isNaN(revenue) && revenue > 0;
                        }).length;
                        const conversionRate = callsOver2Min > 0 ? (conversionsOver2Min / callsOver2Min) * 100 : 0;
                        
                        // Color based on conversion rate: 0% = purple (88, 28, 135), 100% = blue (124, 58, 237)
                        const getColor = (rate: number) => {
                          if (total === 0) return 'rgb(229, 231, 235)'; // gray if no calls
                          if (rate === 0) return 'rgb(88, 28, 135)'; // dark purple
                          if (rate < 10) return 'rgb(109, 40, 217)'; // purple
                          if (rate < 20) return 'rgb(124, 58, 237)'; // violet
                          if (rate < 30) return 'rgb(139, 92, 246)'; // light violet
                          return 'rgb(167, 139, 250)'; // light blue/purple
                        };
                        
                        return (
                          <div
                            key={day}
                            className="w-20 h-12 border border-white flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: getColor(conversionRate),
                            }}
                            title={`${provider.provider} - ${day}: ${callsOver2Min} calls over 2min, ${conversionsOver2Min} conversions (${conversionRate.toFixed(1)}%)`}
                          >
                            {conversionRate > 0 ? `${conversionRate.toFixed(0)}%` : '-'}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                
                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
                  <span className="text-xs text-muted-foreground">Conversion Rate:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4" style={{ backgroundColor: 'rgb(88, 28, 135)' }}></div>
                    <span className="text-xs">0%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4" style={{ backgroundColor: 'rgb(124, 58, 237)' }}></div>
                    <span className="text-xs">~15%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4" style={{ backgroundColor: 'rgb(167, 139, 250)' }}></div>
                    <span className="text-xs">30%+</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          )}
        </Card>

        {/* ROI Heatmap by Provider */}
        <Card className="mb-6">
          <CardHeader className="cursor-pointer" onClick={() => setRoiHeatmapExpanded(!roiHeatmapExpanded)}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>ROI Heatmap by Provider</CardTitle>
                <CardDescription>Daily ROI % by provider (Green = Positive, Red = Negative)</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                {roiHeatmapExpanded ? '▼' : '▶'}
              </Button>
            </div>
          </CardHeader>
          {roiHeatmapExpanded && (
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* Header Row - Days */}
                <div className="flex mb-2">
                  <div className="w-32 flex-shrink-0"></div>
                  {Array.from(new Set(filteredData.map(c => format(new Date(c.start), "MMM dd"))))
                    .sort((a, b) => {
                      const dateA = new Date(a + " 2025");
                      const dateB = new Date(b + " 2025");
                      return dateA.getTime() - dateB.getTime();
                    })
                    .map((day) => (
                      <div key={day} className="w-20 text-center text-xs font-medium px-1">
                        {day}
                      </div>
                    ))}
                </div>
                
                {/* Provider Rows */}
                {providers.map((provider) => {
                  const allDays = Array.from(new Set(filteredData.map(c => format(new Date(c.start), "MMM dd"))))
                    .sort((a, b) => {
                      const dateA = new Date(a + " 2025");
                      const dateB = new Date(b + " 2025");
                      return dateA.getTime() - dateB.getTime();
                    });
                  
                  return (
                    <div key={provider} className="flex mb-1">
                      <div className="w-32 flex-shrink-0 text-sm font-medium pr-2 flex items-center">
                        {provider}
                      </div>
                      {allDays.map((day) => {
                        // Calculate ROI for this provider on this day
                        const providerDayCalls = filteredData.filter(c => 
                          c.did_seller === provider && 
                          format(new Date(c.start), "MMM dd") === day
                        );
                        
                        const dayCost = providerDayCalls.reduce((sum, call) => {
                          if (call.duration > 120 && call.did_lead_price) {
                            const price = parseFloat(call.did_lead_price.replace(/[$,]/g, ''));
                            return sum + (isNaN(price) ? 0 : price);
                          }
                          return sum;
                        }, 0);
                        
                        const dayRevenue = providerDayCalls.reduce((sum, call) => {
                          if (call.conversion_revenue) {
                            const revenue = parseFloat(call.conversion_revenue.replace(/[$,]/g, ''));
                            return sum + (isNaN(revenue) ? 0 : revenue);
                          }
                          return sum;
                        }, 0);
                        
                        const dayROI = dayCost > 0 ? ((dayRevenue - dayCost) / dayCost * 100) : 0;
                        
                        // Color based on ROI: negative = red, positive = green
                        const getColor = (roi: number) => {
                          if (dayCost === 0) return 'rgb(229, 231, 235)'; // gray if no paid calls
                          if (roi < -50) return 'rgb(153, 27, 27)'; // dark red
                          if (roi < -25) return 'rgb(185, 28, 28)'; // red
                          if (roi < 0) return 'rgb(239, 68, 68)'; // light red
                          if (roi < 25) return 'rgb(34, 197, 94)'; // light green
                          if (roi < 50) return 'rgb(22, 163, 74)'; // green
                          return 'rgb(21, 128, 61)'; // dark green
                        };
                        
                        return (
                          <div
                            key={day}
                            className="w-20 h-12 border border-white flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: getColor(dayROI),
                            }}
                            title={`${provider} - ${day}: Cost: $${dayCost.toFixed(2)}, Revenue: $${dayRevenue.toFixed(2)}, ROI: ${dayROI.toFixed(1)}%`}
                          >
                            {dayCost > 0 ? `${dayROI.toFixed(0)}%` : '-'}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                
                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
                  <span className="text-xs text-muted-foreground">ROI:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4" style={{ backgroundColor: 'rgb(153, 27, 27)' }}></div>
                    <span className="text-xs">{'<'}-50%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4" style={{ backgroundColor: 'rgb(239, 68, 68)' }}></div>
                    <span className="text-xs">-25%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4" style={{ backgroundColor: 'rgb(34, 197, 94)' }}></div>
                    <span className="text-xs">0%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4" style={{ backgroundColor: 'rgb(21, 128, 61)' }}></div>
                    <span className="text-xs">50%+</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          )}
        </Card>

        {/* Overall Average ROI by Day */}
        <Card className="mb-6">
          <CardHeader className="cursor-pointer" onClick={() => setOverallRoiExpanded(!overallRoiExpanded)}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Overall Average ROI by Day</CardTitle>
                <CardDescription>Combined ROI across all providers per day</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                {overallRoiExpanded ? '▼' : '▶'}
              </Button>
            </div>
          </CardHeader>
          {overallRoiExpanded && (
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* Header Row - Days */}
                <div className="flex mb-2">
                  <div className="w-32 flex-shrink-0 text-sm font-medium">All Providers</div>
                  {Array.from(new Set(filteredData.map(c => format(new Date(c.start), "MMM dd"))))
                    .sort((a, b) => {
                      const dateA = new Date(a + " 2025");
                      const dateB = new Date(b + " 2025");
                      return dateA.getTime() - dateB.getTime();
                    })
                    .map((day) => (
                      <div key={day} className="w-20 text-center text-xs font-medium px-1">
                        {day}
                      </div>
                    ))}
                </div>
                
                {/* Overall ROI Row */}
                <div className="flex mb-1">
                  <div className="w-32 flex-shrink-0"></div>
                  {Array.from(new Set(filteredData.map(c => format(new Date(c.start), "MMM dd"))))
                    .sort((a, b) => {
                      const dateA = new Date(a + " 2025");
                      const dateB = new Date(b + " 2025");
                      return dateA.getTime() - dateB.getTime();
                    })
                    .map((day) => {
                      // Calculate overall ROI for this day across all providers
                      const dayCalls = filteredData.filter(c => 
                        format(new Date(c.start), "MMM dd") === day
                      );
                      
                      const dayCost = dayCalls.reduce((sum, call) => {
                        if (call.duration > 120 && call.did_lead_price) {
                          const price = parseFloat(call.did_lead_price.replace(/[$,]/g, ''));
                          return sum + (isNaN(price) ? 0 : price);
                        }
                        return sum;
                      }, 0);
                      
                      const dayRevenue = dayCalls.reduce((sum, call) => {
                        if (call.conversion_revenue) {
                          const revenue = parseFloat(call.conversion_revenue.replace(/[$,]/g, ''));
                          return sum + (isNaN(revenue) ? 0 : revenue);
                        }
                        return sum;
                      }, 0);
                      
                      const dayROI = dayCost > 0 ? ((dayRevenue - dayCost) / dayCost * 100) : 0;
                      
                      // Color based on ROI: negative = red, positive = green
                      const getColor = (roi: number) => {
                        if (dayCost === 0) return 'rgb(229, 231, 235)'; // gray if no paid calls
                        if (roi < -50) return 'rgb(153, 27, 27)'; // dark red
                        if (roi < -25) return 'rgb(185, 28, 28)'; // red
                        if (roi < 0) return 'rgb(239, 68, 68)'; // light red
                        if (roi < 25) return 'rgb(34, 197, 94)'; // light green
                        if (roi < 50) return 'rgb(22, 163, 74)'; // green
                        return 'rgb(21, 128, 61)'; // dark green
                      };
                      
                      return (
                        <div
                          key={day}
                          className="w-20 h-16 border border-white flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: getColor(dayROI),
                          }}
                          title={`${day}: Cost: $${dayCost.toFixed(2)}, Revenue: $${dayRevenue.toFixed(2)}, ROI: ${dayROI.toFixed(1)}%`}
                        >
                          {dayCost > 0 ? `${dayROI.toFixed(0)}%` : '-'}
                        </div>
                      );
                    })}
                </div>
                
                {/* Stats Row */}
                <div className="flex mt-2 pt-2 border-t">
                  <div className="w-32 flex-shrink-0 text-xs font-medium text-muted-foreground">Stats</div>
                  {Array.from(new Set(filteredData.map(c => format(new Date(c.start), "MMM dd"))))
                    .sort((a, b) => {
                      const dateA = new Date(a + " 2025");
                      const dateB = new Date(b + " 2025");
                      return dateA.getTime() - dateB.getTime();
                    })
                    .map((day) => {
                      const dayCalls = filteredData.filter(c => 
                        format(new Date(c.start), "MMM dd") === day
                      );
                      const dayCost = dayCalls.reduce((sum, call) => {
                        if (call.duration > 120 && call.did_lead_price) {
                          const price = parseFloat(call.did_lead_price.replace(/[$,]/g, ''));
                          return sum + (isNaN(price) ? 0 : price);
                        }
                        return sum;
                      }, 0);
                      const dayRevenue = dayCalls.reduce((sum, call) => {
                        if (call.conversion_revenue) {
                          const revenue = parseFloat(call.conversion_revenue.replace(/[$,]/g, ''));
                          return sum + (isNaN(revenue) ? 0 : revenue);
                        }
                        return sum;
                      }, 0);
                      
                      return (
                        <div key={day} className="w-20 text-center text-xs px-1">
                          <div className="text-muted-foreground">Cost: ${dayCost.toFixed(0)}</div>
                          <div className="text-muted-foreground">Rev: ${dayRevenue.toFixed(0)}</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </CardContent>
          )}
        </Card>

        {/* Provider Performance Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Provider Performance</CardTitle>
            <CardDescription>Ranked by ROI - identify winning and losing providers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="cursor-pointer hover:bg-primary/10" onClick={() => handleSort("provider")}>
                    Provider {sortField === "provider" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-primary/10" onClick={() => handleSort("totalCalls")}>
                    Total Calls {sortField === "totalCalls" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-primary/10" onClick={() => handleSort("paidCalls")}>
                    Paid Calls {sortField === "paidCalls" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-primary/10" onClick={() => handleSort("cost")}>
                    Cost {sortField === "cost" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-primary/10" onClick={() => handleSort("revenue")}>
                    Revenue {sortField === "revenue" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-primary/10" onClick={() => handleSort("profit")}>
                    Profit {sortField === "profit" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-primary/10" onClick={() => handleSort("roi")}>
                    ROI {sortField === "roi" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProviderStats.map((stat) => {
                  const providerCalls = filteredData.filter(c => c.did_seller === stat.provider);
                  const isExpanded = expandedProviders[stat.provider];
                  
                  return (
                    <>
                      <TableRow 
                        key={stat.provider} 
                        className="hover:bg-primary/5 cursor-pointer"
                        onClick={() => toggleProviderExpand(stat.provider)}
                      >
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {isExpanded ? '▼' : '▶'}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{stat.provider}</TableCell>
                        <TableCell className="text-right">{stat.totalCalls}</TableCell>
                        <TableCell className="text-right">{stat.paidCalls}</TableCell>
                        <TableCell className="text-right">${stat.cost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${stat.revenue.toFixed(2)}</TableCell>
                        <TableCell className={`text-right font-medium ${stat.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${stat.profit.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${stat.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.roi.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                      
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-muted/50 p-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm mb-2">Detailed Calls for {stat.provider}</h4>
                              <div className="max-h-96 overflow-y-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Call ID</TableHead>
                                      <TableHead>Phone</TableHead>
                                      <TableHead>Date/Time</TableHead>
                                      <TableHead className="text-right">Duration</TableHead>
                                      <TableHead className="text-right">Cost</TableHead>
                                      <TableHead className="text-right">Has Conversion</TableHead>
                                      <TableHead className="text-right">Revenue</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {providerCalls.map((call) => {
                                      const callCost = call.duration > 120 && call.did_lead_price 
                                        ? parseFloat(call.did_lead_price.replace(/[$,]/g, ''))
                                        : 0;
                                      const callRevenue = call.conversion_revenue 
                                        ? parseFloat(call.conversion_revenue.replace(/[$,]/g, ''))
                                        : 0;
                                      
                                      return (
                                        <TableRow key={call.id} className="text-xs">
                                          <TableCell className="font-mono">{call.id.substring(0, 8)}...</TableCell>
                                          <TableCell>{call.CID_num}</TableCell>
                                          <TableCell>{format(new Date(call.start), "MMM dd, HH:mm")}</TableCell>
                                          <TableCell className="text-right">{call.duration}s</TableCell>
                                          <TableCell className="text-right">
                                            {callCost > 0 ? `$${callCost.toFixed(2)}` : '-'}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {call.conversion_revenue ? 'Yes' : 'No'}
                                          </TableCell>
                                          <TableCell className="text-right font-medium">
                                            {callRevenue > 0 ? `$${callRevenue.toFixed(2)}` : '-'}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                              <div className="text-xs text-muted-foreground mt-2">
                                Showing {providerCalls.length} total calls • 
                                {' '}{providerCalls.filter(c => c.conversion_revenue).length} with conversions
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Individual Call Search Results */}
        {phoneSearch && (
          <Card>
            <CardHeader>
              <CardTitle>Call Search Results</CardTitle>
              <CardDescription>Calls matching phone number: {phoneSearch}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>DID</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.slice(0, 50).map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>{format(new Date(call.start), "MMM dd, HH:mm")}</TableCell>
                      <TableCell>{call.CID_num}</TableCell>
                      <TableCell>{call.DID_num}</TableCell>
                      <TableCell>{call.duration}s</TableCell>
                      <TableCell>{call.did_seller || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        {(call.duration > 120 && call.did_lead_price) ? `$${parseFloat(call.did_lead_price).toFixed(2)}` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {call.conversion_revenue ? `$${parseFloat(call.conversion_revenue).toFixed(2)}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(filteredData.length > 50) && (
                <p className="text-sm text-muted-foreground mt-4">
                  Showing first 50 of {filteredData.length} results
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
