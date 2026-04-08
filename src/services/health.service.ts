import { http } from '@/src/lib/http';
import { PingResponse } from '@/src/types/domain';

export async function ping() {
  const { data } = await http.get<PingResponse>('/ping');
  return data;
}
