/**
 * Server actions for data operations
 * This file provides standardized functions for CRUD operations using Prisma
 */

'use server'

import { revalidatePath } from 'next/cache';
import { prisma } from './db';

/**
 * Generic type for API responses
 */
type ApiResponse<T> = {
  data?: T;
  error?: string;
  status: 'success' | 'error';
};

/**
 * Generic function to handle errors in server actions
 */
const handleError = (error: unknown): string => {
  console.error('Server action error:', error);
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

/**
 * Generic function to get all records from a model
 */
export async function getAll<T>(
  model: string,
  options: {
    where?: any;
    orderBy?: any;
    include?: any;
    take?: number;
    skip?: number;
  } = {}
): Promise<ApiResponse<T[]>> {
  try {
    // @ts-ignore - Dynamic access to Prisma models
    const data = await prisma[model].findMany(options);
    
    return {
      data,
      status: 'success'
    };
  } catch (error) {
    return {
      error: handleError(error),
      status: 'error'
    };
  }
}

/**
 * Generic function to get a single record by ID
 */
export async function getById<T>(
  model: string,
  id: string,
  options: {
    include?: any;
  } = {}
): Promise<ApiResponse<T>> {
  try {
    // @ts-ignore - Dynamic access to Prisma models
    const data = await prisma[model].findUnique({
      where: { id },
      ...options
    });
    
    if (!data) {
      return {
        error: `${model} with ID ${id} not found`,
        status: 'error'
      };
    }
    
    return {
      data,
      status: 'success'
    };
  } catch (error) {
    return {
      error: handleError(error),
      status: 'error'
    };
  }
}

/**
 * Generic function to create a new record
 */
export async function create<T>(
  model: string,
  data: any,
  options: {
    include?: any;
    revalidatePath?: string;
  } = {}
): Promise<ApiResponse<T>> {
  try {
    // @ts-ignore - Dynamic access to Prisma models
    const createdItem = await prisma[model].create({
      data,
      ...(options.include ? { include: options.include } : {})
    });
    
    if (options.revalidatePath) {
      revalidatePath(options.revalidatePath);
    }
    
    return {
      data: createdItem,
      status: 'success'
    };
  } catch (error) {
    return {
      error: handleError(error),
      status: 'error'
    };
  }
}

/**
 * Generic function to update a record
 */
export async function update<T>(
  model: string,
  id: string,
  data: any,
  options: {
    include?: any;
    revalidatePath?: string;
  } = {}
): Promise<ApiResponse<T>> {
  try {
    // @ts-ignore - Dynamic access to Prisma models
    const updatedItem = await prisma[model].update({
      where: { id },
      data,
      ...(options.include ? { include: options.include } : {})
    });
    
    if (options.revalidatePath) {
      revalidatePath(options.revalidatePath);
    }
    
    return {
      data: updatedItem,
      status: 'success'
    };
  } catch (error) {
    return {
      error: handleError(error),
      status: 'error'
    };
  }
}

/**
 * Generic function to delete a record
 */
export async function remove<T>(
  model: string,
  id: string,
  options: {
    revalidatePath?: string;
  } = {}
): Promise<ApiResponse<T>> {
  try {
    // @ts-ignore - Dynamic access to Prisma models
    const deletedItem = await prisma[model].delete({
      where: { id }
    });
    
    if (options.revalidatePath) {
      revalidatePath(options.revalidatePath);
    }
    
    return {
      data: deletedItem,
      status: 'success'
    };
  } catch (error) {
    return {
      error: handleError(error),
      status: 'error'
    };
  }
}

/**
 * User-specific actions
 */
export const userActions = {
  getAll: (options = {}) => getAll<any>('user', options),
  getById: (id: string, options = {}) => getById<any>('user', id, options),
  create: (data: any, options = {}) => create<any>('user', data, options),
  update: (id: string, data: any, options = {}) => update<any>('user', id, data, options),
  delete: (id: string, options = {}) => remove<any>('user', id, options)
};

/**
 * Example of model-specific actions
 * You can create similar objects for other models
 */
export const exampleModelActions = {
  getAll: (options = {}) => getAll<any>('exampleModel', options),
  getById: (id: string, options = {}) => getById<any>('exampleModel', id, options),
  create: (data: any, options = {}) => create<any>('exampleModel', data, options),
  update: (id: string, data: any, options = {}) => update<any>('exampleModel', id, data, options),
  delete: (id: string, options = {}) => remove<any>('exampleModel', id, options)
};

// Export a default object with all actions
export default {
  getAll,
  getById,
  create,
  update,
  remove,
  user: userActions,
  // Add other model-specific actions here
};