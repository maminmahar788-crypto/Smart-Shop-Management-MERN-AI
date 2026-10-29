const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export function setToken(token) { token ? localStorage.setItem('shop_token', token) : localStorage.removeItem('shop_token'); }
export async function api(path, options={}) {
 const token=localStorage.getItem('shop_token');
 const headers={...(options.body ? {'Content-Type':'application/json'} : {}), ...(token ? {Authorization:'Bearer '+token} : {}), ...(options.headers||{})};
 const response=await fetch(`${BASE}${path}`, {...options, headers});
 const type=response.headers.get('content-type')||'';
 if (!response.ok) { const data=type.includes('application/json') ? await response.json() : {}; throw new Error(data.message || `Request failed (${response.status})`); }
 if (type.includes('application/pdf')) return response.blob();
 return response.json();
}
