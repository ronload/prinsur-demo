/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, use } from "react";
import { Users, Phone, Mail, Plus, AlertTriangle, Edit, Save, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockCustomers } from "@/data/mock-agent-data";
import { Customer, CustomerStatus, Policy } from "@/types/agent-dashboard";

export default function ClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const [customers, setCustomers] = useState(mockCustomers);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: "",
    email: "",
    phone: "",
    age: 0,
    gender: "male",
    location: { city: "", district: "" },
    interestedProducts: [],
    status: "new",
    notes: "",
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("zh-TW");

  const getCustomerStatusBadge = (status: CustomerStatus) => {
    const statusConfig = {
      new: {
        label: locale === "en" ? "New Customer" : "新客戶",
        variant: "secondary" as const,
      },
      contacted: {
        label: locale === "en" ? "Contacted" : "已聯絡",
        variant: "default" as const,
      },
      meeting_scheduled: {
        label: locale === "en" ? "Meeting Scheduled" : "會議預定",
        variant: "default" as const,
      },
      proposal_sent: {
        label: locale === "en" ? "Proposal Sent" : "已送提案",
        variant: "default" as const,
      },
      closed: {
        label: locale === "en" ? "Closed" : "已成交",
        variant: "default" as const,
      },
      lost: {
        label: locale === "en" ? "Lost" : "已流失",
        variant: "destructive" as const,
      },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer({ ...customer });
    setIsEditDialogOpen(true);
  };

  const handleSaveCustomer = () => {
    if (editingCustomer) {
      setCustomers(prev =>
        prev.map(customer =>
          customer.id === editingCustomer.id ? editingCustomer : customer
        )
      );
      setIsEditDialogOpen(false);
      setEditingCustomer(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingCustomer(null);
  };

  const updateEditingCustomer = (field: keyof Customer, value: any) => {
    if (editingCustomer) {
      setEditingCustomer(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // If it starts with 09 and has 10 digits, format as 09xx-xxx-xxx
    if (digits.startsWith('09') && digits.length === 10) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
    }

    // If it has 10 digits but doesn't start with 09, still format but don't enforce 09
    if (digits.length === 10) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
    }

    // Return digits as is for incomplete numbers
    return digits;
  };

  const handlePhoneChange = (phoneInput: string) => {
    const formatted = formatPhoneNumber(phoneInput);
    updateEditingCustomer("phone", formatted);
  };

  const handleAddCustomer = () => {
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      age: 0,
      gender: "male",
      location: { city: "", district: "" },
      interestedProducts: [],
      status: "new",
      notes: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveNewCustomer = () => {
    if (newCustomer.name && newCustomer.email && newCustomer.phone) {
      const customer: Customer = {
        id: `customer-${Date.now()}`,
        name: newCustomer.name!,
        email: newCustomer.email!,
        phone: newCustomer.phone!,
        age: newCustomer.age || 0,
        gender: newCustomer.gender || "male",
        location: newCustomer.location || { city: "", district: "" },
        interestedProducts: newCustomer.interestedProducts || [],
        status: newCustomer.status || "new",
        assignedDate: new Date().toISOString().split('T')[0],
        lastContact: new Date().toISOString().split('T')[0],
        notes: newCustomer.notes || "",
        policies: [],
      };

      setCustomers(prev => [customer, ...prev]);
      setIsAddDialogOpen(false);
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        age: 0,
        gender: "male",
        location: { city: "", district: "" },
        interestedProducts: [],
        status: "new",
        notes: "",
      });
    }
  };

  const handleCancelAdd = () => {
    setIsAddDialogOpen(false);
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      age: 0,
      gender: "male",
      location: { city: "", district: "" },
      interestedProducts: [],
      status: "new",
      notes: "",
    });
  };

  const updateNewCustomer = (field: keyof Partial<Customer>, value: any) => {
    setNewCustomer(prev => ({ ...prev, [field]: value }));
  };

  const handleNewCustomerPhoneChange = (phoneInput: string) => {
    const formatted = formatPhoneNumber(phoneInput);
    updateNewCustomer("phone", formatted);
  };

  const handleDeleteCustomer = () => {
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteCustomer = () => {
    if (editingCustomer) {
      setCustomers(prev => prev.filter(customer => customer.id !== editingCustomer.id));
      setIsDeleteConfirmOpen(false);
      setIsEditDialogOpen(false);
      setEditingCustomer(null);
    }
  };

  const cancelDeleteCustomer = () => {
    setIsDeleteConfirmOpen(false);
  };

  // Helper function to get policies expiring within 3 months
  const getPoliciesExpiringWithinThreeMonths = (
    policies?: Policy[],
  ): Policy[] => {
    if (!policies) return [];

    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    return policies.filter((policy) => {
      const expirationDate = new Date(policy.expirationDate);
      return (
        policy.status === "active" &&
        expirationDate >= today &&
        expirationDate <= threeMonthsFromNow
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 md:container md:py-8">
        <div className="space-y-4">
          <div className="flex sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-2xl font-bold">
                {locale === "en" ? "Customer List" : "客戶清單"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {locale === "en"
                  ? "Manage your prospects and existing customers"
                  : "管理您的潛在客戶和現有客戶"}
              </p>
            </div>
            <Button size="sm" className="self-start sm:self-auto" onClick={handleAddCustomer}>
              <Plus className="h-4 w-4 mr-1" />
              {locale === "en" ? "Add Customer" : "新增客戶"}
            </Button>
          </div>

          <div className="space-y-3">
            {customers.map((customer) => {
              const expiringPolicies = getPoliciesExpiringWithinThreeMonths(
                customer.policies,
              );
              const hasExpiringPolicies = expiringPolicies.length > 0;

              return (
                <Card
                  key={customer.id}
                  className={`w-full overflow-hidden ${hasExpiringPolicies ? "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1 py-1">
                          <CardTitle className="truncate mb-2">
                            {customer.name}
                          </CardTitle>
                          <CardDescription className="leading-relaxed">
                            {customer.age}
                            {locale === "en" ? "yrs" : "歲"} •{" "}
                            {customer.location.city}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex flex-col gap-2 items-end">
                        {hasExpiringPolicies && (
                          <Badge
                            variant="destructive"
                            className="text-xs flex items-center gap-1"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {expiringPolicies.length}
                            {locale === "en" ? " expiring" : " 即將到期"}
                          </Badge>
                        )}
                        {getCustomerStatusBadge(customer.status)}
                      </div>
                    </div>

                    {/* Display expiring policies */}
                    {hasExpiringPolicies && (
                      <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-700">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                            {locale === "en"
                              ? `${expiringPolicies.length} policy${expiringPolicies.length > 1 ? "ies" : ""} expiring within 3 months`
                              : `${expiringPolicies.length} 份保單將於三個月內到期`}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {expiringPolicies.map((policy) => (
                            <div
                              key={policy.id}
                              className="text-xs text-orange-700 dark:text-orange-300 flex justify-between"
                            >
                              <span>{policy.productName}</span>
                              <span>{formatDate(policy.expirationDate)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent>
                    <div className="mb-3">
                      <div className="grid grid-cols-3 gap-3 mb-2">
                        <div className="flex items-center gap-2 text-sm col-span-2">
                          <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{customer.phone}</span>
                        </div>
                        <div className="text-xs text-muted-foreground text-right sm:text-left">
                          {locale === "en" ? "Last Contact" : "最後聯絡"}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="text-sm font-medium text-right sm:text-left">
                          {formatDate(customer.lastContact)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {customer.interestedProducts
                        .slice(0, 2)
                        .map((product) => (
                          <Badge
                            key={product}
                            variant="outline"
                            className="text-xs"
                          >
                            {product}
                          </Badge>
                        ))}
                      {customer.interestedProducts.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{customer.interestedProducts.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Phone className="h-3 w-3 mr-1" />
                        {locale === "en" ? "Call" : "電話"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        {locale === "en" ? "Edit" : "編輯"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[425px] mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {locale === "en" ? "Edit Customer" : "編輯客戶"}
            </DialogTitle>
            <DialogDescription>
              {locale === "en"
                ? "Update customer information and status"
                : "更新客戶資訊和狀態"}
            </DialogDescription>
          </DialogHeader>
          {editingCustomer && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {locale === "en" ? "Name" : "姓名"}
                </Label>
                <Input
                  id="name"
                  value={editingCustomer.name}
                  onChange={(e) => updateEditingCustomer("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  {locale === "en" ? "Email" : "電子郵件"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editingCustomer.email}
                  onChange={(e) => updateEditingCustomer("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {locale === "en" ? "Phone" : "電話"}
                </Label>
                <Input
                  id="phone"
                  value={editingCustomer.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="09xx-xxx-xxx"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">
                    {locale === "en" ? "Age" : "年齡"}
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={editingCustomer.age}
                    onChange={(e) => updateEditingCustomer("age", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">
                    {locale === "en" ? "City" : "城市"}
                  </Label>
                  <Input
                    id="city"
                    value={editingCustomer.location.city}
                    onChange={(e) => updateEditingCustomer("location", {...editingCustomer.location, city: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">
                  {locale === "en" ? "Status" : "狀態"}
                </Label>
                <Select
                  value={editingCustomer.status}
                  onValueChange={(value) => updateEditingCustomer("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">
                      {locale === "en" ? "New Customer" : "新客戶"}
                    </SelectItem>
                    <SelectItem value="contacted">
                      {locale === "en" ? "Contacted" : "已聯絡"}
                    </SelectItem>
                    <SelectItem value="meeting_scheduled">
                      {locale === "en" ? "Meeting Scheduled" : "會議預定"}
                    </SelectItem>
                    <SelectItem value="proposal_sent">
                      {locale === "en" ? "Proposal Sent" : "已送提案"}
                    </SelectItem>
                    <SelectItem value="closed">
                      {locale === "en" ? "Closed" : "已成交"}
                    </SelectItem>
                    <SelectItem value="lost">
                      {locale === "en" ? "Lost" : "已流失"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">
                  {locale === "en" ? "Notes" : "備註"}
                </Label>
                <Textarea
                  id="notes"
                  value={editingCustomer.notes || ""}
                  onChange={(e) => updateEditingCustomer("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
            {/* 桌面端左側的刪除按鈕 */}
            <Button
              variant="destructive"
              onClick={handleDeleteCustomer}
              className="hidden sm:flex flex-0 sm:w-auto sm:px-4"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {locale === "en" ? "Delete" : "刪除"}
            </Button>

            {/* 移動端下方的儲存按鈕 */}
            <Button onClick={handleSaveCustomer} className="w-full sm:hidden">
              <Save className="h-4 w-4 mr-2" />
              {locale === "en" ? "Save" : "儲存"}
            </Button>

            {/* 移動端上方的刪除+取消組合，桌面端右側的取消+儲存組合 */}
            <div className="flex gap-2">
              {/* 移動端的刪除按鈕 */}
              <Button
                variant="destructive"
                onClick={handleDeleteCustomer}
                className="flex-1 sm:hidden"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {locale === "en" ? "Delete" : "刪除"}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} className="flex-1 sm:w-auto sm:px-4">
                <X className="h-4 w-4 mr-2" />
                {locale === "en" ? "Cancel" : "取消"}
              </Button>
              {/* 桌面端的儲存按鈕 */}
              <Button onClick={handleSaveCustomer} className="hidden sm:flex flex-2 sm:w-auto sm:px-4">
                <Save className="h-4 w-4 mr-2" />
                {locale === "en" ? "Save" : "儲存"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[425px] mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {locale === "en" ? "Add New Customer" : "新增客戶"}
            </DialogTitle>
            <DialogDescription>
              {locale === "en"
                ? "Enter new customer information"
                : "輸入新客戶資訊"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">
                {locale === "en" ? "Name" : "姓名"} *
              </Label>
              <Input
                id="new-name"
                value={newCustomer.name || ""}
                onChange={(e) => updateNewCustomer("name", e.target.value)}
                placeholder={locale === "en" ? "Enter customer name" : "輸入客戶姓名"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">
                {locale === "en" ? "Email" : "電子郵件"} *
              </Label>
              <Input
                id="new-email"
                type="email"
                value={newCustomer.email || ""}
                onChange={(e) => updateNewCustomer("email", e.target.value)}
                placeholder={locale === "en" ? "Enter email address" : "輸入電子郵件"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-phone">
                {locale === "en" ? "Phone" : "電話"} *
              </Label>
              <Input
                id="new-phone"
                value={newCustomer.phone || ""}
                onChange={(e) => handleNewCustomerPhoneChange(e.target.value)}
                placeholder="09xx-xxx-xxx"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-age">
                  {locale === "en" ? "Age" : "年齡"}
                </Label>
                <Input
                  id="new-age"
                  type="number"
                  value={newCustomer.age || ""}
                  onChange={(e) => updateNewCustomer("age", parseInt(e.target.value) || 0)}
                  placeholder={locale === "en" ? "Age" : "年齡"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-gender">
                  {locale === "en" ? "Gender" : "性別"}
                </Label>
                <Select
                  value={newCustomer.gender}
                  onValueChange={(value) => updateNewCustomer("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={locale === "en" ? "Select gender" : "選擇性別"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">
                      {locale === "en" ? "Male" : "男性"}
                    </SelectItem>
                    <SelectItem value="female">
                      {locale === "en" ? "Female" : "女性"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-city">
                {locale === "en" ? "City" : "城市"}
              </Label>
              <Input
                id="new-city"
                value={newCustomer.location?.city || ""}
                onChange={(e) => updateNewCustomer("location", {...(newCustomer.location || {}), city: e.target.value})}
                placeholder={locale === "en" ? "Enter city" : "輸入城市"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-notes">
                {locale === "en" ? "Notes" : "備註"}
              </Label>
              <Textarea
                id="new-notes"
                value={newCustomer.notes || ""}
                onChange={(e) => updateNewCustomer("notes", e.target.value)}
                rows={3}
                placeholder={locale === "en" ? "Add any additional notes..." : "新增任何額外備註..."}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              onClick={handleSaveNewCustomer}
              disabled={!newCustomer.name || !newCustomer.email || !newCustomer.phone}
              className="flex-1 sm:w-20 order-1 sm:order-2"
            >
              <Save className="h-4 w-4 mr-2" />
              {locale === "en" ? "Save" : "儲存"}
            </Button>
            <Button variant="outline" onClick={handleCancelAdd} className="flex-1 sm:w-20 order-2 sm:order-1">
              <X className="h-4 w-4 mr-2" />
              {locale === "en" ? "Cancel" : "取消"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[400px] mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {locale === "en" ? "Delete Customer" : "刪除客戶"}
            </DialogTitle>
            <DialogDescription>
              {locale === "en"
                ? "Are you sure you want to delete this customer? This action cannot be undone."
                : "確定要刪除此客戶嗎？此操作無法復原。"}
            </DialogDescription>
          </DialogHeader>
          {editingCustomer && (
            <div className="py-4">
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {locale === "en" ? "Customer to be deleted:" : "即將刪除的客戶："}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  <strong>{editingCustomer.name}</strong> - {editingCustomer.email}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={cancelDeleteCustomer} className="flex-1 sm:w-20">
              <X className="h-4 w-4 mr-2" />
              {locale === "en" ? "Cancel" : "取消"}
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCustomer} className="flex-1 sm:w-20">
              <Trash2 className="h-4 w-4 mr-2" />
              {locale === "en" ? "Delete" : "刪除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
