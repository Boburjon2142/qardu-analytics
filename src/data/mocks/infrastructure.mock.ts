import {
  BuildingCapacityData,
  DormitoryCapacityItem,
} from "@/features/dashboard/types";

export const BUILDINGS_CAPACITY_MOCK: BuildingCapacityData[] = [
  { id: "b1", name: "Bosh o'quv binosi", type: "O'quv binosi", capacity: 3800, occupancy: 3450 },
  { id: "b2", name: "2-o'quv binosi", type: "O'quv binosi", capacity: 2600, occupancy: 2300 },
  { id: "b3", name: "IT va innovatsiyalar markazi", type: "O'quv va laboratoriya", capacity: 1900, occupancy: 1750 },
  { id: "b4", name: "Tabiiy fanlar korpusi", type: "Laboratoriya va o'quv", capacity: 2200, occupancy: 1950 },
  { id: "b5", name: "Axborot-resurs markazi (ARM)", type: "Kutubxona va o'quv zallari", capacity: 1200, occupancy: 890 },
  { id: "b6", name: "Madaniyat va sport majmuasi", type: "Sport va madaniy zal", capacity: 1500, occupancy: 1120 },
];

// Sum occupied = 4 120, Vacant = 200, Total = 4 320
export const DORMITORIES_CAPACITY_MOCK: DormitoryCapacityItem[] = [
  { id: "ttj-1", name: "1-sonli Talabalar turar joyi", totalCapacity: 850, occupiedSpots: 810, vacantSpots: 40 },
  { id: "ttj-2", name: "2-sonli Talabalar turar joyi", totalCapacity: 920, occupiedSpots: 880, vacantSpots: 40 },
  { id: "ttj-3", name: "3-sonli Talabalar turar joyi", totalCapacity: 750, occupiedSpots: 710, vacantSpots: 40 },
  { id: "ttj-4", name: "4-sonli Talabalar turar joyi", totalCapacity: 1000, occupiedSpots: 960, vacantSpots: 40 },
  { id: "ttj-5", name: "5-sonli TTJ (Yangi bino)", totalCapacity: 800, occupiedSpots: 760, vacantSpots: 40 },
];
