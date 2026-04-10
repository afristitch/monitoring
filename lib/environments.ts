export interface Environment {
  id: string;
  name: string;
  baseUrl: string;
  healthUrl: string;
}

export const DEFAULT_ENVIRONMENTS: Environment[] = [
  { 
    id: "local", 
    name: "Local Development", 
    baseUrl: "http://localhost:5000/api/v1", 
    healthUrl: "http://localhost:5000/api/v1/health" 
  },
  { 
    id: "staging", 
    name: "Staging", 
    baseUrl: "https://api-dev.sewdigital.app/api/v1", 
    healthUrl: "https://api-dev.sewdigital.app/api/v1/health" 
  },
  { 
    id: "prod", 
    name: "Production", 
    baseUrl: "https://api.sewdigital.app/api/v1", 
    healthUrl: "https://api.sewdigital.app/api/v1/health" 
  },
];

export const getEnvironmentById = (id: string) => {
  return DEFAULT_ENVIRONMENTS.find(e => e.id === id) || DEFAULT_ENVIRONMENTS[0];
};
