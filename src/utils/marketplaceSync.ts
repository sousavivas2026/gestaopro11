export function initializeMarketplaceStorage() {
  if (!localStorage.getItem('marketplace_orders')) {
    localStorage.setItem('marketplace_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('marketplace_mode')) {
    localStorage.setItem('marketplace_mode', 'teste');
  }
}

export function validateAndNormalizeOrders() {
  try {
    const ordersJson = localStorage.getItem('marketplace_orders');
    if (!ordersJson) return [];
    
    const orders = JSON.parse(ordersJson);
    
    const normalized = orders.map((order: any) => ({
      ...order,
      status: order.status === 'concluído' ? 'concluido' : order.status,
      created_date: order.created_date || order.created_at || new Date().toISOString(),
    }));
    
    localStorage.setItem('marketplace_orders', JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    console.error('Erro ao validar pedidos:', error);
    return [];
  }
}

export function updateOrderStatus(orderId: string, newStatus: string, employeeName?: string) {
  try {
    const orders = JSON.parse(localStorage.getItem('marketplace_orders') || '[]');
    const updatedOrders = orders.map((order: any) => 
      order.id === orderId 
        ? { ...order, status: newStatus, completed_by: employeeName || order.completed_by }
        : order
    );
    localStorage.setItem('marketplace_orders', JSON.stringify(updatedOrders));
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return false;
  }
}
