import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { supabase } from '../db/supabase.js';

const ProductCreateSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional().default('PCS'),
  weight: z.number().optional(),
  volume: z.number().optional(),
  barcode: z.string().optional(),
  minStock: z.number().optional().default(0),
  maxStock: z.number().optional().default(999999)
});

export const productManageTool: Tool = {
  name: 'product_manage',
  description: 'Create, update, or delete products',
  inputSchema: {
    type: 'object',
    properties: {
      action: { 
        type: 'string', 
        enum: ['create', 'update', 'delete', 'list'],
        description: 'Action to perform'
      },
      productId: { type: 'string', description: 'Product UUID (for update/delete)' },
      data: {
        type: 'object',
        properties: {
          sku: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          unit: { type: 'string' },
          weight: { type: 'number' },
          volume: { type: 'number' },
          barcode: { type: 'string' },
          minStock: { type: 'number' },
          maxStock: { type: 'number' }
        }
      }
    },
    required: ['action']
  }
};

export async function handleProductManage(args: any) {
  const { action, productId, data } = args;

  switch (action) {
    case 'create': {
      const productData = ProductCreateSchema.parse(data);
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          sku: productData.sku,
          name: productData.name,
          description: productData.description,
          category: productData.category,
          unit: productData.unit,
          weight: productData.weight,
          volume: productData.volume,
          barcode: productData.barcode,
          min_stock: productData.minStock,
          max_stock: productData.maxStock,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create product: ${error.message}`);
      }

      return { success: true, product };
    }

    case 'update': {
      if (!productId) {
        throw new Error('Product ID is required for update');
      }

      const updates: any = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.description !== undefined) updates.description = data.description;
      if (data.category !== undefined) updates.category = data.category;
      if (data.unit !== undefined) updates.unit = data.unit;
      if (data.weight !== undefined) updates.weight = data.weight;
      if (data.volume !== undefined) updates.volume = data.volume;
      if (data.barcode !== undefined) updates.barcode = data.barcode;
      if (data.minStock !== undefined) updates.min_stock = data.minStock;
      if (data.maxStock !== undefined) updates.max_stock = data.maxStock;

      const { data: product, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }

      return { success: true, product };
    }

    case 'delete': {
      if (!productId) {
        throw new Error('Product ID is required for delete');
      }

      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId);

      if (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
      }

      return { success: true, message: 'Product deactivated' };
    }

    case 'list': {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Failed to list products: ${error.message}`);
      }

      return { success: true, products };
    }

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}