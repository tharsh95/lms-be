import { Request, Response } from 'express';
import { IUser } from '../models/user.model';

// Environment variables interface
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  MONGODB_URI: string;
}

// Request with typed body, params, and query
export interface TypedRequest<
  TBody = Record<string, any>,
  TParams extends Record<string, string> = Record<string, string>,
  TQuery extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>
> extends Request {
  body: TBody;
  params: TParams;
  query: TQuery;
}

// Response with typed data
export interface TypedResponse<TResponseData = any> extends Response {
  json: (data: TResponseData) => this;
}

// Common API response format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  message?: string;
}

// User-related request/response types
export type CreateUserRequest = TypedRequest<{
  name: string;
  email: string;
  password: string;
}>;

export type UpdateUserRequest = TypedRequest<
  Partial<Omit<IUser, '_id'>>,
  { id: string }
>;

export type UserResponse = ApiResponse<
  Omit<IUser, 'password'> | Omit<IUser, 'password'>[]
>;

// For async handlers with cleaner error handling
export type AsyncHandler<TReq = Request, TRes = Response> = (
  req: TReq,
  res: TRes,
  next: Function
) => Promise<void>;

// No default export for type-only module

