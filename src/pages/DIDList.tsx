import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, Trash2, X } from "lucide-react";

interface DIDNumber {
  id: string;
  number: string;
  seller: string | null;
  vertical: string | null;
  campaign_status: string | null;
  lead_price: string | null;
  system_config_notes: string | null;
}

export default function DIDList() {
  const [didNumbers, setDidNumbers] = useState<DIDNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<DIDNumber>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const [newRow, setNewRow] = useState<Partial<DIDNumber>>({
    number: "",
    seller: "",
    vertical: "",
    campaign_status: "",
    lead_price: "",
    system_config_notes: "",
  });
  const [filters, setFilters] = useState({
    seller: "",
    vertical: "",
    campaign_status: "all",
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DIDNumber | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
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
    fetchDIDNumbers();
  }, []);

  const fetchDIDNumbers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("did_numbers")
        .select("*")
        .order("number");

      if (error) throw error;
      setDidNumbers(data || []);
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

  const startEdit = (did: DIDNumber) => {
    setEditingId(did.id);
    setEditData(did);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from("did_numbers")
        .update(editData)
        .eq("id", editingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "DID number updated successfully",
      });

      fetchDIDNumbers();
      setEditingId(null);
      setEditData({});
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addNewRow = async () => {
    if (!newRow.number) {
      toast({
        title: "Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("did_numbers").insert([{
        number: newRow.number!,
        seller: newRow.seller || null,
        vertical: newRow.vertical || null,
        campaign_status: newRow.campaign_status || null,
        lead_price: newRow.lead_price || null,
        system_config_notes: newRow.system_config_notes || null,
      }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "New DID number added successfully",
      });

      fetchDIDNumbers();
      setIsAdding(false);
      setNewRow({
        number: "",
        seller: "",
        vertical: "",
        campaign_status: "",
        lead_price: "",
        system_config_notes: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this DID number?")) return;

    try {
      const { error } = await supabase.from("did_numbers").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "DID number deleted successfully",
      });

      fetchDIDNumbers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredData = didNumbers.filter((did) => {
    if (filters.seller && !did.seller?.toLowerCase().includes(filters.seller.toLowerCase())) return false;
    if (filters.vertical && !did.vertical?.toLowerCase().includes(filters.vertical.toLowerCase())) return false;
    if (filters.campaign_status && filters.campaign_status !== "all" && did.campaign_status !== filters.campaign_status) return false;
    return true;
  });

  const uniqueSellers = [...new Set(didNumbers.map((d) => d.seller).filter(Boolean))];
  const uniqueVerticals = [...new Set(didNumbers.map((d) => d.vertical).filter(Boolean))];
  const uniqueStatuses = [...new Set(didNumbers.map((d) => d.campaign_status).filter(Boolean))];

  const handleSort = (key: keyof DIDNumber) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="text-muted-foreground">-</span>;
    
    const badgeStyles: Record<string, string> = {
      Active: "bg-green-500 text-white hover:bg-green-600",
      Pending: "bg-yellow-500 text-white hover:bg-yellow-600",
      Inactive: "bg-red-500 text-white hover:bg-red-600",
    };

    return (
      <Badge className={badgeStyles[status] || "bg-gray-500 text-white"}>
        {status}
      </Badge>
    );
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
      {/* Sidebar - Same as SupervisorDashboard */}
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
          }}>
            <i className="fas fa-tools" style={{ marginRight: sidebarCollapsed ? 0 : '12px' }}></i>
            {!sidebarCollapsed && <span>Tool Page</span>}
          </a>
          
          <a href="/did-list" className="nav-item active" style={{
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
          }}>
            <i className="fas fa-phone" style={{ marginRight: sidebarCollapsed ? 0 : '12px' }}></i>
            {!sidebarCollapsed && <span>DID List</span>}
          </a>

          <a href="/lead-analytics" className="nav-item" style={{
            display: 'flex',
            alignItems: 'center',
            padding: sidebarCollapsed ? '12px 0' : '12px 20px',
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '8px',
            borderRadius: '10px',
            width: '100%',
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
            }}
          >
            <i className="fas fa-sign-out-alt" style={{ marginRight: sidebarCollapsed ? 0 : '12px' }}></i>
            {!sidebarCollapsed && <span>Log Out</span>}
          </a>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px 30px', overflow: 'auto' }}>
        <div className="container mx-auto py-8 px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">DID List Management</h1>
            <p className="text-muted-foreground">
              Manage phone numbers, sellers, and campaign information
            </p>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Filter by Seller</label>
                <Input
                  placeholder="Search seller..."
                  value={filters.seller}
                  onChange={(e) => setFilters({ ...filters, seller: e.target.value })}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Filter by Vertical</label>
                <Input
                  placeholder="Search vertical..."
                  value={filters.vertical}
                  onChange={(e) => setFilters({ ...filters, vertical: e.target.value })}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                <Select
                  value={filters.campaign_status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, campaign_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status!}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => setFilters({ seller: "", vertical: "", campaign_status: "all" })}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">DID Numbers</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredData.length} of {didNumbers.length} numbers
                </p>
              </div>
              <Button onClick={() => setIsAdding(true)} disabled={isAdding} className="text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add New Number
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px] text-center cursor-pointer hover:bg-muted/50" onClick={() => handleSort("number")}>
                      Number {sortConfig.key === "number" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleSort("seller")}>
                      Seller {sortConfig.key === "seller" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleSort("vertical")}>
                      Vertical {sortConfig.key === "vertical" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleSort("campaign_status")}>
                      Campaign Status {sortConfig.key === "campaign_status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleSort("lead_price")}>
                      Lead Price {sortConfig.key === "lead_price" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleSort("system_config_notes")}>
                      Config Notes {sortConfig.key === "system_config_notes" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="w-[100px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isAdding && (
                    <TableRow>
                      <TableCell className="text-center">
                        <Input
                          value={newRow.number}
                          onChange={(e) => setNewRow({ ...newRow, number: e.target.value })}
                          placeholder="(xxx) xxx-xxxx"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          value={newRow.seller}
                          onChange={(e) => setNewRow({ ...newRow, seller: e.target.value })}
                          placeholder="Seller name"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          value={newRow.vertical}
                          onChange={(e) => setNewRow({ ...newRow, vertical: e.target.value })}
                          placeholder="Vertical"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Select
                          value={newRow.campaign_status}
                          onValueChange={(value) =>
                            setNewRow({ ...newRow, campaign_status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          value={newRow.lead_price}
                          onChange={(e) => setNewRow({ ...newRow, lead_price: e.target.value })}
                          placeholder="$100"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          value={newRow.system_config_notes}
                          onChange={(e) =>
                            setNewRow({ ...newRow, system_config_notes: e.target.value })
                          }
                          placeholder="Notes"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" onClick={addNewRow}>
                            <Save className="h-4 w-4 text-white" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsAdding(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {sortedData.map((did) => (
                    <TableRow key={did.id}>
                      <TableCell className="text-center">
                        {editingId === did.id ? (
                          <Input
                            value={editData.number}
                            onChange={(e) =>
                              setEditData({ ...editData, number: e.target.value })
                            }
                          />
                        ) : (
                          did.number
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === did.id ? (
                          <Input
                            value={editData.seller || ""}
                            onChange={(e) =>
                              setEditData({ ...editData, seller: e.target.value })
                            }
                          />
                        ) : (
                          did.seller || "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === did.id ? (
                          <Input
                            value={editData.vertical || ""}
                            onChange={(e) =>
                              setEditData({ ...editData, vertical: e.target.value })
                            }
                          />
                        ) : (
                          did.vertical || "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === did.id ? (
                          <Select
                            value={editData.campaign_status || ""}
                            onValueChange={(value) =>
                              setEditData({ ...editData, campaign_status: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          getStatusBadge(did.campaign_status)
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === did.id ? (
                          <Input
                            value={editData.lead_price || ""}
                            onChange={(e) =>
                              setEditData({ ...editData, lead_price: e.target.value })
                            }
                          />
                        ) : (
                          did.lead_price || "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === did.id ? (
                          <Input
                            value={editData.system_config_notes || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                system_config_notes: e.target.value,
                              })
                            }
                          />
                        ) : (
                          did.system_config_notes || "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === did.id ? (
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" onClick={saveEdit}>
                              <Save className="h-4 w-4 text-white" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" variant="outline" onClick={() => startEdit(did)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteRow(did.id)}
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {sortedData.length === 0 && !isAdding && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No DID numbers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
