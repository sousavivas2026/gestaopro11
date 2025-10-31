import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface ManualOrderFormProps {
  onOrderCreated: () => void;
}

export function ManualOrderForm({ onOrderCreated }: ManualOrderFormProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newOrder = {
      id: `${Date.now()}`,
      order_number: formData.get('order_number'),
      customer_name: formData.get('customer_name'),
      items: [
        {
          product: formData.get('product'),
          quantity: parseInt(formData.get('quantity') as string),
          location: formData.get('location'),
        }
      ],
      status: 'pendente',
      created_date: new Date().toISOString(),
      source: 'manual'
    };
    
    const orders = JSON.parse(localStorage.getItem('marketplace_orders') || '[]');
    orders.push(newOrder);
    localStorage.setItem('marketplace_orders', JSON.stringify(orders));
    
    toast.success("Pedido manual registrado!");
    setOpen(false);
    onOrderCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Registrar Pedido Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Pedido Manual</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="order_number">Número do Pedido *</Label>
            <Input id="order_number" name="order_number" defaultValue={`MAN-${Date.now()}`} required />
          </div>
          <div>
            <Label htmlFor="customer_name">Nome do Cliente *</Label>
            <Input id="customer_name" name="customer_name" required />
          </div>
          <div>
            <Label htmlFor="product">Produto *</Label>
            <Input id="product" name="product" required />
          </div>
          <div>
            <Label htmlFor="quantity">Quantidade *</Label>
            <Input id="quantity" name="quantity" type="number" defaultValue={1} required />
          </div>
          <div>
            <Label htmlFor="location">Localização</Label>
            <Input id="location" name="location" placeholder="Ex: A-1" />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Registrar</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
