// Campus ID to name mapping
export const CAMPUS_MAP = {
  '5': 'National',
  '4': 'Stavanger',
  '3': 'Trondheim',
  '2': 'Bergen',
  '1': 'Oslo'
} as const;

// Function to map campus ID to name
export const mapCampus = (campusId: string) => {
  return CAMPUS_MAP[campusId as keyof typeof CAMPUS_MAP] || 'National';
};

// Function to map campus name to ID
export const mapCampusNameToId = (campusName: string): string => {
  const entry = Object.entries(CAMPUS_MAP).find(([_, name]) => 
    name.toLowerCase() === campusName.toLowerCase()
  );
  return entry?.[0] || '1'; // Default to Oslo (1) if not found
};