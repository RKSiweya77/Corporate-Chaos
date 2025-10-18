// src/hooks/useEscrow.js
import { useContext } from 'react';
import { EscrowContext } from '../context/EscrowContext';

/**
 * Enhanced escrow hook with additional utilities
 */
export function useEscrow() {
  const context = useContext(EscrowContext);
  
  if (!context) {
    throw new Error('useEscrow must be used within an EscrowProvider');
  }

  // Add convenience methods
  const enhancedContext = {
    ...context,
    
    // Check if escrow can be released for an order
    canReleaseEscrow: (order) => {
      if (!order || !order.escrow_status) return false;
      return order.escrow_status === 'held' && 
             order.status === 'delivered' &&
             !order.dispute_id;
    },
    
    // Check if escrow can be disputed
    canDisputeEscrow: (order) => {
      if (!order || !order.escrow_status) return false;
      return order.escrow_status === 'held' && 
             order.status !== 'cancelled' &&
             !order.dispute_id;
    },
    
    // Format escrow status for display
    formatEscrowStatus: (status) => {
      const statusMap = {
        'pending': { label: 'Pending', variant: 'warning' },
        'held': { label: 'In Escrow', variant: 'info' },
        'released': { label: 'Released', variant: 'success' },
        'refunded': { label: 'Refunded', variant: 'secondary' },
        'disputed': { label: 'In Dispute', variant: 'danger' },
      };
      return statusMap[status] || { label: status, variant: 'secondary' };
    },
    
    // Calculate escrow release date
    getEscrowReleaseDate: (orderDate, holdDays = 3) => {
      if (!orderDate) return null;
      const releaseDate = new Date(orderDate);
      releaseDate.setDate(releaseDate.getDate() + holdDays);
      return releaseDate;
    },
    
    // Check if escrow release is available
    isEscrowReleaseAvailable: (order) => {
      if (!order?.created_at) return false;
      const releaseDate = enhancedContext.getEscrowReleaseDate(order.created_at);
      return new Date() >= releaseDate;
    },
  };

  return enhancedContext;
}

export default useEscrow;