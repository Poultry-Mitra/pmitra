
export type VaccinationScheduleItem = {
    day: number;
    vaccine: string;
    method: string;
};

export const broilerVaccinationSchedule: VaccinationScheduleItem[] = [
  { day: 1, vaccine: "Marek's Disease", method: 'Injection (at hatchery)' },
  { day: 7, vaccine: 'Ranikhet (LaSota/F-strain)', method: 'Eye Drop / Drinking Water' },
  { day: 14, vaccine: 'Gumboro (IBD) - Mild Strain', method: 'Eye Drop / Drinking Water' },
  { day: 21, vaccine: 'Ranikhet (LaSota) - Booster', method: 'Drinking Water' },
  { day: 28, vaccine: 'Gumboro (IBD) - Booster', method: 'Drinking Water' },
];

// In the future, we can add schedules for Layers and other types.
export const layerVaccinationSchedule: VaccinationScheduleItem[] = [
    // ... define layer-specific schedule here
];
