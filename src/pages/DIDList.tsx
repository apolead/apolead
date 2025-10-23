import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    campaign_status: "",
  });
  const { toast } = useToast();

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
    if (filters.campaign_status && did.campaign_status !== filters.campaign_status) return false;
    return true;
  });

  const uniqueSellers = [...new Set(didNumbers.map((d) => d.seller).filter(Boolean))];
  const uniqueVerticals = [...new Set(didNumbers.map((d) => d.vertical).filter(Boolean))];
  const uniqueStatuses = [...new Set(didNumbers.map((d) => d.campaign_status).filter(Boolean))];

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
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
                <SelectItem value="">All statuses</SelectItem>
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
            onClick={() => setFilters({ seller: "", vertical: "", campaign_status: "" })}
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
          <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Number
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Number</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Vertical</TableHead>
                <TableHead>Campaign Status</TableHead>
                <TableHead>Lead Price</TableHead>
                <TableHead>Config Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && (
                <TableRow>
                  <TableCell>
                    <Input
                      value={newRow.number}
                      onChange={(e) => setNewRow({ ...newRow, number: e.target.value })}
                      placeholder="(xxx) xxx-xxxx"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newRow.seller}
                      onChange={(e) => setNewRow({ ...newRow, seller: e.target.value })}
                      placeholder="Seller name"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newRow.vertical}
                      onChange={(e) => setNewRow({ ...newRow, vertical: e.target.value })}
                      placeholder="Vertical"
                    />
                  </TableCell>
                  <TableCell>
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
                  <TableCell>
                    <Input
                      value={newRow.lead_price}
                      onChange={(e) => setNewRow({ ...newRow, lead_price: e.target.value })}
                      placeholder="$100"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newRow.system_config_notes}
                      onChange={(e) =>
                        setNewRow({ ...newRow, system_config_notes: e.target.value })
                      }
                      placeholder="Notes"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addNewRow}>
                        <Save className="h-4 w-4" />
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
              {filteredData.map((did) => (
                <TableRow key={did.id}>
                  <TableCell>
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
                  <TableCell>
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
                  <TableCell>
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
                  <TableCell>
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
                      did.campaign_status || "-"
                    )}
                  </TableCell>
                  <TableCell>
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
                  <TableCell>
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
                  <TableCell>
                    {editingId === did.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(did)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteRow(did.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && !isAdding && (
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
  );
}
