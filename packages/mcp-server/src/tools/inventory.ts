import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { supabase } from '../db/supabase.js';

const InventoryCheckSchema = z.object({
  productId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  sku: z.string().optional(),
  includeDetails: z.boolean().optional().default(false)
});

export const inventoryCheckTool: Tool = {
  name: 'inventory_check',
  description: 'Check current inventory levels by product, location, or SKU',
  inputSchema: {
    type: 'object',
    properties: {
      productId: { type: 'string', description: 'Product UUID' },
      locationId: { type: 'string', description: 'Location UUID' },
      sku: { type: 'string', description: 'Product SKU' },
      includeDetails: { type: 'boolean', description: 'Include product and location details' }
    }
  }
};

export async function handleInventoryCheck(args: unknown) {
  const params = InventoryCheckSchema.parse(args);
  
  let query = supabase
    .from('inventory')
    .select(`
      *,
      product:products!inner(*),
      location:locations!inner(*)
    `);

  if (params.productId) {
    query = query.eq('product_id', params.productId);
  }
  
  if (params.locationId) {
    query = query.eq('location_id', params.locationId);
  }
  
  if (params.sku) {
    query = query.eq('product.sku', params.sku);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to check inventory: ${error.message}`);
  }

  if (!params.includeDetails) {
    return data?.map(item => ({
      productSku: item.product.sku,
      locationCode: item.location.code,
      quantity: item.quantity,
      lotNumber: item.lot_number,
      expiryDate: item.expiry_date
    }));
  }

  return data;
}

const InventoryTransferSchema = z.object({
  productId: z.string().uuid(),
  fromLocationId: z.string().uuid(),
  toLocationId: z.string().uuid(),
  quantity: z.number().positive(),
  lotNumber: z.string().optional(),
  reason: z.string().optional()
});

export const inventoryTransferTool: Tool = {
  name: 'inventory_transfer',
  description: 'Transfer inventory between locations',
  inputSchema: {
    type: 'object',
    properties: {
      productId: { type: 'string', description: 'Product UUID' },
      fromLocationId: { type: 'string', description: 'Source location UUID' },
      toLocationId: { type: 'string', description: 'Destination location UUID' },
      quantity: { type: 'number', description: 'Quantity to transfer' },
      lotNumber: { type: 'string', description: 'Lot number (optional)' },
      reason: { type: 'string', description: 'Reason for transfer (optional)' }
    },
    required: ['productId', 'fromLocationId', 'toLocationId', 'quantity']
  }
};

export async function handleInventoryTransfer(args: unknown) {
  const params = InventoryTransferSchema.parse(args);
  
  // Start a transaction
  const { data: fromInventory, error: fromError } = await supabase
    .from('inventory')
    .select('*')
    .eq('product_id', params.productId)
    .eq('location_id', params.fromLocationId)
    .eq('lot_number', params.lotNumber || '')
    .single();

  if (fromError || !fromInventory) {
    throw new Error('Source inventory not found');
  }

  if (fromInventory.quantity < params.quantity) {
    throw new Error(`Insufficient inventory. Available: ${fromInventory.quantity}`);
  }

  // Update source inventory
  const newFromQuantity = fromInventory.quantity - params.quantity;
  if (newFromQuantity === 0) {
    await supabase
      .from('inventory')
      .delete()
      .eq('id', fromInventory.id);
  } else {
    await supabase
      .from('inventory')
      .update({ quantity: newFromQuantity })
      .eq('id', fromInventory.id);
  }

  // Update or create destination inventory
  const { data: toInventory } = await supabase
    .from('inventory')
    .select('*')
    .eq('product_id', params.productId)
    .eq('location_id', params.toLocationId)
    .eq('lot_number', params.lotNumber || '')
    .single();

  if (toInventory) {
    await supabase
      .from('inventory')
      .update({ quantity: toInventory.quantity + params.quantity })
      .eq('id', toInventory.id);
  } else {
    await supabase
      .from('inventory')
      .insert({
        product_id: params.productId,
        location_id: params.toLocationId,
        quantity: params.quantity,
        lot_number: params.lotNumber,
        expiry_date: fromInventory.expiry_date
      });
  }

  // Record movement
  await supabase
    .from('inventory_movements')
    .insert({
      product_id: params.productId,
      from_location_id: params.fromLocationId,
      to_location_id: params.toLocationId,
      quantity: params.quantity,
      movement_type: 'TRANSFER',
      reason: params.reason || 'Manual transfer',
      performed_by: 'MCP User'
    });

  return {
    success: true,
    message: `Transferred ${params.quantity} units from ${params.fromLocationId} to ${params.toLocationId}`
  };
}