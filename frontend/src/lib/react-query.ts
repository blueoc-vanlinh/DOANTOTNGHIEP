import { AxiosError } from 'axios';
import {
  QueryClient,
  type DefaultOptions,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: true,
    retry: 1,
  },
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });

export type PromiseValue<PromiseType, Otherwise = PromiseType> =
  PromiseType extends Promise<infer Value>
  ? {
    0: PromiseValue<Value>;
    1: Value;
  }[PromiseType extends Promise<unknown> ? 0 : 1]
  : Otherwise;

export type ExtractFnReturnType<FnType extends (...args: unknown[]) => unknown> = PromiseValue<
  ReturnType<FnType>
>;

export type QueryConfig<
  QueryFnType extends (...args: unknown[]) => unknown,
  TError = unknown,
  TData = ExtractFnReturnType<QueryFnType>,
  TQueryKey extends unknown[] = unknown[],
> = Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>;

export type MutationConfig<MutationFnType extends (...args: unknown[]) => unknown> = UseMutationOptions<
  ExtractFnReturnType<MutationFnType>,
  AxiosError<unknown>,
  Parameters<MutationFnType>[0]
>;
