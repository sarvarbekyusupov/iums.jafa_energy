// Reports Types
export interface CreateReportDto {
  name: string;
  description?: string;
  reportType: string;
  createdBy: number;
  parameters: any;
  schedule?: any;
  isPublic?: boolean;
  lastGenerated?: string;
}

export interface UpdateReportDto {
  name?: string;
  description?: string;
  reportType?: string;
  createdBy?: number;
  parameters?: any;
  schedule?: any;
  isPublic?: boolean;
  lastGenerated?: string;
}

export interface ReportResponseDto {
  id: number;
  name: string;
  description?: string;
  reportType: string;
  createdBy: number;
  parameters: any;
  schedule: any;
  isPublic: boolean;
  lastGenerated?: string;
  createdAt: string;
  updatedAt: string;
}

// Sites Types
export interface CreateSiteDto {
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  capacityKw?: number;
  installationDate?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  fusionSolarPlantId?: string;
  description?: string;
  siteType?: 'ground_mount' | 'rooftop' | 'floating' | 'agri_pv';
  inverterCount?: number;
  panelCount?: number;
  siteManagerId?: number;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface UpdateSiteDto {
  name?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  capacityKw?: number;
  installationDate?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  fusionSolarPlantId?: string;
  description?: string;
  siteType?: 'ground_mount' | 'rooftop' | 'floating' | 'agri_pv';
  inverterCount?: number;
  panelCount?: number;
  siteManagerId?: number;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface SiteResponseDto {
  id: number;
  name: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  capacityKw?: string;
  installationDate?: string;
  status: 'active' | 'inactive' | 'maintenance';
  fusionSolarPlantId?: string;
  description?: string;
  siteType: 'ground_mount' | 'rooftop' | 'floating' | 'agri_pv';
  inverterCount: number;
  panelCount: number;
  siteManagerId?: number;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  hopeCloudPlantId?: string;
  createdAt: string;
  updatedAt: string;
}