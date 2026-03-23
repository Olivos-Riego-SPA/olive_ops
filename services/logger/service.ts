import { postApi } from '@/lib/fetch';

export interface UserLastLoginRequest {
  clientsIds: string[];
  countrysidesIds: string[];
}

export async function getUserLastLoginService(req: UserLastLoginRequest): Promise<any> {
  const response = await postApi('/logger/users/login', req);
  if (response.code === 201) return response.data;
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}
