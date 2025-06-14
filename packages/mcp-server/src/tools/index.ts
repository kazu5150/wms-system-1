import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { 
  inventoryCheckTool, 
  inventoryTransferTool,
  handleInventoryCheck,
  handleInventoryTransfer
} from './inventory.js';
import {
  productManageTool,
  handleProductManage
} from './products.js';

export const tools: Tool[] = [
  inventoryCheckTool,
  inventoryTransferTool,
  productManageTool
];

export const toolHandlers = {
  inventory_check: handleInventoryCheck,
  inventory_transfer: handleInventoryTransfer,
  product_manage: handleProductManage
};