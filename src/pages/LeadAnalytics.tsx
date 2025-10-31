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
  actual_submits?: number;
  conversion_phone?: string;
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
      
      // Fetch calls
      const { data: callsData, error: callsError } = await supabase
        .from("calls_with_did")
        .select("id, CID_num, DID_num, start, duration, did_seller, did_lead_price, conversion_revenue, lastStatus")
        .gte("start", startDate.toISOString())
        .lte("start", endDate.toISOString())
        .order("start", { ascending: false });

      if (callsError) throw callsError;

      // Fetch conversions for the same date range
      const { data: conversionsData, error: conversionsError } = await supabase
        .from("conversion_data")
        .select('"Customer phone - Copy directly from RM", "Actual Submits", "Revenue", "Timestamp"')
        .gte('"Timestamp"', startDate.toISOString())
        .lte('"Timestamp"', endDate.toISOString());

      if (conversionsError) throw conversionsError;

      // Create a map of phone numbers to conversions (normalize phone numbers)
      const normalizePhone = (phone: string | null) => {
        if (!phone) return '';
        return phone.replace(/\D/g, ''); // Remove all non-digit characters
      };

      const conversionMap = new Map();
      conversionsData?.forEach((conv: any) => {
        const normalizedPhone = normalizePhone(conv["Customer phone - Copy directly from RM"]);
        if (normalizedPhone) {
          conversionMap.set(normalizedPhone, {
            actual_submits: conv["Actual Submits"] || 0,
            revenue: conv["Revenue"] || null,
          });
        }
      });

      // Merge conversion data with calls
      const mergedData = callsData?.map((call) => {
        const normalizedPhone = normalizePhone(call.CID_num);
        const conversion = conversionMap.get(normalizedPhone);
        
        return {
          ...call,
          actual_submits: conversion?.actual_submits || 0,
          conversion_phone: normalizedPhone,
        };
      }) || [];

      setCallData(mergedData);
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
      const price = parseFloat(call.did_lead_price);
      return sum + (isNaN(price) ? 0 : price);
    }
    return sum;
  }, 0);

  // Calculate total revenue - using Actual Submits * average price per submit
  // Based on user feedback, the revenue calculation should account for all conversions
  const PRICE_PER_SUBMIT = 38.54; // Average revenue per actual submit
  const totalRevenue = filteredData.reduce((sum, call) => {
    if (call.actual_submits && call.actual_submits > 0) {
      return sum + (call.actual_submits * PRICE_PER_SUBMIT);
    }
    // Fallback to conversion_revenue if available
    if (call.conversion_revenue) {
      const revenueStr = call.conversion_revenue.replace(/[$,]/g, '');
      const revenue = parseFloat(revenueStr);
      return sum + (isNaN(revenue) ? 0 : revenue);
    }
    return sum;
  }, 0);

  // Calculate ROI
  const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost * 100) : 0;

  // Calculate conversion rates (based on actual_submits from conversion_data)
  const callsWithConversion = filteredData.filter((c) => {
    return c.actual_submits && c.actual_submits > 0;
  }).length;
  const overallConversionRate = totalCalls > 0 ? (callsWithConversion / totalCalls * 100) : 0;
  
  const callsOver2Min = filteredData.filter((c) => c.duration > 120).length;
  const conversionsOver2Min = filteredData.filter((c) => {
    if (c.duration <= 120) return false;
    return c.actual_submits && c.actual_submits > 0;
  }).length;
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

  const callsByDayData = Object.entries(callsByDay).map(([day, count]) => ({
    day,
    calls: count,
  }));

  // Conversions by day (based on actual_submits)
  const conversionsByDay = filteredData.reduce((acc, call) => {
    if (!call.actual_submits || call.actual_submits <= 0) return acc;
    
    const day = format(new Date(call.start), "MMM dd");
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const conversionsByDayData = Object.entries(conversionsByDay).map(([day, count]) => ({
    day,
    conversions: count,
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

    const revenue = providerCalls.reduce((sum, call) => {
      // Calculate from actual_submits first
      if (call.actual_submits && call.actual_submits > 0) {
        return sum + (call.actual_submits * 38.54); // Standard price per submit
      }
      // Fallback to conversion_revenue field
      if (!call.conversion_revenue) return sum;
      const revenueStr = call.conversion_revenue.replace(/[$,]/g, '');
      const rev = parseFloat(revenueStr);
      return sum + (isNaN(rev) ? 0 : rev);
    }, 0);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCalls}</div>
              <p className="text-xs text-muted-foreground">
                Avg {avgCallsPerDay.toFixed(1)} per day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {callsWithConversion} conversions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {callsOver120s} paid leads ({'>'}2min)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI</CardTitle>
              {roi >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {roi.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
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
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="calls" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

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
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="conversions" stroke="#7c3aed" strokeWidth={3} dot={{ fill: "#581c87", r: 5 }} />
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
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
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
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Provider Heatmap */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Provider Performance Heatmap</CardTitle>
            <CardDescription>Conversion rate % by provider and day (Blue = High, Purple = Low)</CardDescription>
          </CardHeader>
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
                        
                        // Find conversions for this provider on this day
                        const dayStart = new Date(day + " 2025");
                        const providerDayCalls = filteredData.filter(c => 
                          c.did_seller === provider.provider && 
                          format(new Date(c.start), "MMM dd") === day
                        );
                        const conversions = providerDayCalls.filter(c => c.actual_submits && c.actual_submits > 0).length;
                        const conversionRate = total > 0 ? (conversions / total) * 100 : 0;
                        
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
                            title={`${provider.provider} - ${day}: ${total} calls, ${conversions} conversions (${conversionRate.toFixed(1)}%)`}
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
                                      <TableHead className="text-right">Submits</TableHead>
                                      <TableHead className="text-right">Revenue</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {providerCalls.map((call) => {
                                      const callCost = call.duration > 120 && call.did_lead_price 
                                        ? parseFloat(call.did_lead_price.replace(/[$,]/g, ''))
                                        : 0;
                                      const callRevenue = call.actual_submits ? call.actual_submits * 38.54 : 0;
                                      
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
                                            {call.actual_submits || '-'}
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
                                {' '}{providerCalls.filter(c => c.actual_submits && c.actual_submits > 0).length} with conversions
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
