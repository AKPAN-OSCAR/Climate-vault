export interface UserProfile {
  name: string;
  initials: string;
  location: string;
  farmType: string;
  farmSize: string;
  phone: string;
  language: string;
}

export interface ClimateState {
  riskScore: number;
  riskLevel: string;
  lastUpdated: string;
}

export interface Goal {
  id: number;
  name: string;
  icon: string;
  saved: number;
  target: number;
  category: string;
  climate: boolean;
  complete: boolean;
}

export interface VaultState {
  totalSaved: number;
  climateReserves: number;
  activeGoals: number;
  fundedPercent: number;
  totalTarget: number;
  goals: Goal[];
}

export interface ConnectivityState {
  online: boolean;
  pendingTransfer: boolean;
  pendingAmount: number;
  pendingFund: string;
}

export interface AlertItem {
  id: number;
  type: string;
  severity: string;
  color: string;
  title: string;
  location: string;
  description: string;
  recommendation: string;
  deadline: string;
  communityReports: number;
  amount: number;
  fund: string;
}

export interface CommunityReport {
  id: number;
  type: string;
  icon: string;
  location: string;
  description: string;
  reporter: string;
  time: string;
  verified: number;
  status: string;
}

export interface AdvisorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AppState {
  user: UserProfile;
  climate: ClimateState;
  vault: VaultState;
  connectivity: ConnectivityState;
  alerts: AlertItem[];
  communityReports: CommunityReport[];
  advisor: {
    messages: AdvisorMessage[];
  };
  currentAlert: AlertItem | null;
  currentGoal: Goal | null;
}
