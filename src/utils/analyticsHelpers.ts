import { format } from "date-fns";

export interface CallData {
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

export const parseRevenue = (revenueStr: string | null): number => {
  if (!revenueStr) return 0;
  const cleaned = revenueStr.replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const parsePrice = (priceStr: string | null): number => {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const calculateTotalRevenue = (calls: CallData[]): number => {
  const revenueByPhone: Record<string, number> = {};
  
  calls.forEach(call => {
    if (call.conversion_revenue && call.CID_num) {
      const revenue = parseRevenue(call.conversion_revenue);
      if (revenue > 0 && !revenueByPhone[call.CID_num]) {
        revenueByPhone[call.CID_num] = revenue;
      }
    }
  });
  
  return Object.values(revenueByPhone).reduce((sum, rev) => sum + rev, 0);
};

export const calculateTotalCost = (calls: CallData[]): number => {
  return calls.reduce((sum, call) => {
    if (call.duration > 120 && call.did_lead_price) {
      const price = parsePrice(call.did_lead_price);
      return sum + price;
    }
    return sum;
  }, 0);
};

export const getUniqueConversionPhones = (calls: CallData[]): Set<string> => {
  const phones = new Set<string>();
  
  calls.forEach(call => {
    if (call.conversion_revenue && call.CID_num) {
      const revenue = parseRevenue(call.conversion_revenue);
      if (revenue > 0) {
        phones.add(call.CID_num);
      }
    }
  });
  
  return phones;
};

export const exportChartsAsImage = async (toast: any) => {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const container = document.querySelector('.charts-container');
    
    if (container) {
      const canvas = await html2canvas(container as HTMLElement);
      const link = document.createElement('a');
      link.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: "Success",
        description: "Charts exported successfully",
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    toast({
      title: "Error",
      description: "Failed to export charts",
      variant: "destructive",
    });
  }
};
