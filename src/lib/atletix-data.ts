export type MembershipStatus = "active" | "expiring" | "expired";

export type ProgressEntry = {
  date: string;
  weightKg: number;
  waistCm: number;
  hipCm: number;
  legCm: number;
  armCm: number;
};

export type RoutineExercise = {
  name: string;
  sets: string;
  reps: string;
  load: string;
  media: string;
  note: string;
};

export type Routine = {
  id: string;
  memberId: string;
  name: string;
  day: string;
  coachNotes: string;
  completedThisWeek: number;
  exercises: RoutineExercise[];
};

export type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  goal: string;
  birthYear: number;
  heightCm: number;
  initialWeightKg: number;
  currentWeightKg: number;
  joinedAt: string;
  membershipStart: string;
  membershipEnd: string;
  level: "Rookie" | "Warrior" | "Elite" | "Titan" | "Icon" | "Legend";
  xp: number;
  streakDays: number;
  weeklyGoal: number;
  weeklyCompleted: number;
  avatarUnlocks: string[];
  achievements: string[];
  progress: ProgressEntry[];
};

export type Payment = {
  id: string;
  memberId: string;
  amount: number;
  paidAt: string;
  periodStart: string;
  periodEnd: string;
  method: "Transferencia" | "Efectivo" | "Nequi" | "Daviplata";
  source: "WhatsApp" | "Recepcion" | "Manual";
};

export const today = new Date("2026-05-18T12:00:00-05:00");

export const trainer = {
  name: "Coach Andrea",
  gym: "ATLETIX",
  slogan: "Fuerza sin límites",
};

export const motivationalMessages = [
  "Hoy el compromiso no se negocia.",
  "Tu version fuerte te esta esperando.",
  "Disciplina hoy, orgullo manana.",
  "ATLETIX construye fuerza, constancia y progreso.",
  "Un entrenamiento mas cerca de tu mejor version.",
];

export const members: Member[] = [
  {
    id: "isabella-rojas",
    name: "Isabella Rojas",
    email: "isabella@atletix.demo",
    phone: "573001112233",
    initials: "IR",
    goal: "Ganar masa muscular",
    birthYear: 1998,
    heightCm: 165,
    initialWeightKg: 58,
    currentWeightKg: 60.4,
    joinedAt: "2026-02-08",
    membershipStart: "2026-05-08",
    membershipEnd: "2026-06-08",
    level: "Warrior",
    xp: 1280,
    streakDays: 6,
    weeklyGoal: 5,
    weeklyCompleted: 4,
    avatarUnlocks: ["Guantes", "Medalla rosa", "Aura neon"],
    achievements: ["3 dias seguidos", "Pago temprano", "Pierna completa"],
    progress: [
      { date: "2026-02-08", weightKg: 58, waistCm: 72, hipCm: 96, legCm: 53, armCm: 28 },
      { date: "2026-03-09", weightKg: 58.8, waistCm: 71, hipCm: 98, legCm: 54, armCm: 28.5 },
      { date: "2026-04-10", weightKg: 59.7, waistCm: 70, hipCm: 99, legCm: 55, armCm: 29 },
      { date: "2026-05-12", weightKg: 60.4, waistCm: 69, hipCm: 101, legCm: 56, armCm: 29.5 },
    ],
  },
  {
    id: "camila-torres",
    name: "Camila Torres",
    email: "camila@atletix.demo",
    phone: "573124445566",
    initials: "CT",
    goal: "Bajar grasa",
    birthYear: 1995,
    heightCm: 160,
    initialWeightKg: 71,
    currentWeightKg: 67.8,
    joinedAt: "2026-01-18",
    membershipStart: "2026-04-19",
    membershipEnd: "2026-05-19",
    level: "Elite",
    xp: 2400,
    streakDays: 9,
    weeklyGoal: 5,
    weeklyCompleted: 5,
    avatarUnlocks: ["Fondo especial", "Medalla elite", "Guantes"],
    achievements: ["7 dias seguidos", "Foto progreso", "Cardio perfecto"],
    progress: [
      { date: "2026-01-18", weightKg: 71, waistCm: 83, hipCm: 105, legCm: 59, armCm: 31 },
      { date: "2026-02-20", weightKg: 69.8, waistCm: 81, hipCm: 104, legCm: 58, armCm: 30.5 },
      { date: "2026-03-22", weightKg: 68.6, waistCm: 78, hipCm: 102, legCm: 57, armCm: 30 },
      { date: "2026-05-14", weightKg: 67.8, waistCm: 76, hipCm: 101, legCm: 57, armCm: 29.8 },
    ],
  },
  {
    id: "valentina-gomez",
    name: "Valentina Gomez",
    email: "valentina@atletix.demo",
    phone: "573165557788",
    initials: "VG",
    goal: "Tonificar",
    birthYear: 2001,
    heightCm: 168,
    initialWeightKg: 63,
    currentWeightKg: 62.2,
    joinedAt: "2026-03-03",
    membershipStart: "2026-04-10",
    membershipEnd: "2026-05-10",
    level: "Rookie",
    xp: 680,
    streakDays: 0,
    weeklyGoal: 4,
    weeklyCompleted: 1,
    avatarUnlocks: ["Ropa deportiva"],
    achievements: ["Primer registro", "Primer pago"],
    progress: [
      { date: "2026-03-03", weightKg: 63, waistCm: 75, hipCm: 98, legCm: 54, armCm: 27 },
      { date: "2026-04-05", weightKg: 62.7, waistCm: 74, hipCm: 98, legCm: 54.5, armCm: 27.2 },
      { date: "2026-05-09", weightKg: 62.2, waistCm: 73, hipCm: 99, legCm: 55, armCm: 27.3 },
    ],
  },
  {
    id: "natalia-mendez",
    name: "Natalia Mendez",
    email: "natalia@atletix.demo",
    phone: "573184449900",
    initials: "NM",
    goal: "Fuerza",
    birthYear: 1992,
    heightCm: 170,
    initialWeightKg: 66,
    currentWeightKg: 67.5,
    joinedAt: "2025-12-12",
    membershipStart: "2026-05-01",
    membershipEnd: "2026-06-01",
    level: "Titan",
    xp: 3620,
    streakDays: 13,
    weeklyGoal: 6,
    weeklyCompleted: 5,
    avatarUnlocks: ["Corona fitness", "Aura rosa", "Insignia titan"],
    achievements: ["Racha 7 dias", "Reto mensual", "Peso registrado"],
    progress: [
      { date: "2025-12-12", weightKg: 66, waistCm: 74, hipCm: 99, legCm: 56, armCm: 29 },
      { date: "2026-02-01", weightKg: 66.4, waistCm: 73, hipCm: 100, legCm: 57, armCm: 29.6 },
      { date: "2026-03-18", weightKg: 67, waistCm: 72, hipCm: 101, legCm: 58, armCm: 30 },
      { date: "2026-05-13", weightKg: 67.5, waistCm: 71, hipCm: 102, legCm: 58.5, armCm: 30.4 },
    ],
  },
];

export const payments: Payment[] = [
  {
    id: "pay-1001",
    memberId: "isabella-rojas",
    amount: 150000,
    paidAt: "2026-05-08",
    periodStart: "2026-05-08",
    periodEnd: "2026-06-08",
    method: "Nequi",
    source: "WhatsApp",
  },
  {
    id: "pay-1002",
    memberId: "camila-torres",
    amount: 150000,
    paidAt: "2026-04-19",
    periodStart: "2026-04-19",
    periodEnd: "2026-05-19",
    method: "Transferencia",
    source: "WhatsApp",
  },
  {
    id: "pay-1003",
    memberId: "valentina-gomez",
    amount: 140000,
    paidAt: "2026-04-10",
    periodStart: "2026-04-10",
    periodEnd: "2026-05-10",
    method: "Efectivo",
    source: "Recepcion",
  },
  {
    id: "pay-1004",
    memberId: "natalia-mendez",
    amount: 170000,
    paidAt: "2026-05-01",
    periodStart: "2026-05-01",
    periodEnd: "2026-06-01",
    method: "Daviplata",
    source: "WhatsApp",
  },
  {
    id: "pay-1005",
    memberId: "camila-torres",
    amount: 150000,
    paidAt: "2026-05-18",
    periodStart: "2026-05-19",
    periodEnd: "2026-06-19",
    method: "Transferencia",
    source: "WhatsApp",
  },
];

export const routines: Routine[] = [
  {
    id: "routine-isabella",
    memberId: "isabella-rojas",
    name: "Pierna y gluteo",
    day: "Lunes",
    completedThisWeek: 4,
    coachNotes: "Subir carga en hip thrust si mantiene tecnica limpia.",
    exercises: [
      { name: "Sentadilla", sets: "4", reps: "12", load: "35 kg", media: "Video", note: "Controlar bajada" },
      { name: "Hip thrust", sets: "4", reps: "10", load: "65 kg", media: "Video", note: "Pausa arriba" },
      { name: "Prensa", sets: "4", reps: "12", load: "90 kg", media: "Imagen", note: "Rango completo" },
      { name: "Abductores", sets: "3", reps: "15", load: "30 kg", media: "Imagen", note: "Sin impulso" },
      { name: "Caminadora", sets: "1", reps: "20 min", load: "Incl. 8", media: "Video", note: "Paso firme" },
    ],
  },
  {
    id: "routine-camila",
    memberId: "camila-torres",
    name: "Full body metabolico",
    day: "Martes",
    completedThisWeek: 5,
    coachNotes: "Mantener descansos cortos y registrar peso cada viernes.",
    exercises: [
      { name: "Peso muerto rumano", sets: "4", reps: "10", load: "30 kg", media: "Video", note: "Espalda neutra" },
      { name: "Remo mancuerna", sets: "3", reps: "12", load: "12 kg", media: "Imagen", note: "Codo cerrado" },
      { name: "Step-up", sets: "3", reps: "12", load: "8 kg", media: "Video", note: "Subir con control" },
      { name: "Eliptica", sets: "1", reps: "25 min", load: "Nivel 7", media: "Video", note: "Zona 2" },
    ],
  },
  {
    id: "routine-valentina",
    memberId: "valentina-gomez",
    name: "Tonificacion base",
    day: "Miercoles",
    completedThisWeek: 1,
    coachNotes: "Volver a racha de 3 dias y revisar mensualidad.",
    exercises: [
      { name: "Zancadas", sets: "3", reps: "12", load: "6 kg", media: "Video", note: "Rodilla estable" },
      { name: "Press hombro", sets: "3", reps: "10", load: "7 kg", media: "Imagen", note: "Core firme" },
      { name: "Curl femoral", sets: "3", reps: "15", load: "25 kg", media: "Imagen", note: "Lento" },
      { name: "Bicicleta", sets: "1", reps: "15 min", load: "Nivel 6", media: "Video", note: "Constante" },
    ],
  },
  {
    id: "routine-natalia",
    memberId: "natalia-mendez",
    name: "Fuerza tren inferior",
    day: "Viernes",
    completedThisWeek: 5,
    coachNotes: "Intentar nuevo PR controlado en sentadilla la proxima semana.",
    exercises: [
      { name: "Sentadilla fuerza", sets: "5", reps: "5", load: "70 kg", media: "Video", note: "Descanso 2 min" },
      { name: "Hip thrust pesado", sets: "5", reps: "6", load: "105 kg", media: "Video", note: "Bloqueo fuerte" },
      { name: "Peso muerto", sets: "4", reps: "6", load: "80 kg", media: "Video", note: "Barra pegada" },
      { name: "Gemelos", sets: "4", reps: "15", load: "40 kg", media: "Imagen", note: "Pausa arriba" },
    ],
  },
];

export function getMembershipStatus(member: Member): MembershipStatus {
  const days = getDaysUntil(member.membershipEnd);

  if (days < 0) {
    return "expired";
  }

  if (days <= 3) {
    return "expiring";
  }

  return "active";
}

export function getDaysUntil(date: string) {
  const target = new Date(`${date}T23:59:59-05:00`);
  const ms = target.getTime() - today.getTime();

  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function getStatusLabel(status: MembershipStatus) {
  const labels: Record<MembershipStatus, string> = {
    active: "Al dia",
    expiring: "Por vencer",
    expired: "Vencio",
  };

  return labels[status];
}

export function getRoutineForMember(memberId: string) {
  return routines.find((routine) => routine.memberId === memberId) ?? routines[0];
}

export function getPaymentsForMember(memberId: string) {
  return payments.filter((payment) => payment.memberId === memberId);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00-05:00`));
}

export function calculateAdminStats() {
  const statuses = members.map((member) => getMembershipStatus(member));
  const mayPayments = payments.filter((payment) => payment.paidAt.startsWith("2026-05"));
  const revenueMonth = mayPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const weeklyAttendance = members.reduce((sum, member) => sum + member.weeklyCompleted, 0);

  return {
    totalMembers: members.length,
    activeMembers: statuses.filter((status) => status === "active").length,
    expiringMembers: statuses.filter((status) => status === "expiring").length,
    expiredMembers: statuses.filter((status) => status === "expired").length,
    revenueMonth,
    revenueToday: payments
      .filter((payment) => payment.paidAt === "2026-05-18")
      .reduce((sum, payment) => sum + payment.amount, 0),
    weeklyAttendance,
    newMembers: members.filter((member) => member.joinedAt.startsWith("2026-05")).length,
  };
}

export function getWeightDelta(member: Member) {
  return Number((member.currentWeightKg - member.initialWeightKg).toFixed(1));
}

export function getProgressPercent(member: Member) {
  return Math.min(100, Math.round((member.weeklyCompleted / member.weeklyGoal) * 100));
}
