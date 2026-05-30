import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/utils/supabase/admin";

export type PaymentStatus = "pending" | "approved" | "rejected";

export type MemberPayment = {
  amountCop: number | null;
  createdAt: string;
  id: string;
  method: string;
  notes: string | null;
  paidAt: string;
  periodEnd: string | null;
  periodStart: string | null;
  reviewedAt: string | null;
  screenshotUrl: string | null;
  source: string;
  status: PaymentStatus;
};

export type AdminPayment = MemberPayment & {
  member: {
    email: string;
    id: string;
    name: string;
    membershipPlanId: string | null;
  } | null;
};

export type PaymentsResult<TPayment> = {
  hasMore: boolean;
  isConfigured: boolean;
  payments: TPayment[];
  setupMessage?: string;
};

type PaymentRow = {
  amount_cop: number | null;
  created_at: string;
  id: string;
  member_id: string;
  method: string;
  notes: string | null;
  paid_at: string;
  period_end: string | null;
  period_start: string | null;
  reviewed_at: string | null;
  screenshot_url: string | null;
  source: string;
  status: PaymentStatus;
};

type MemberRow = {
  email: string;
  full_name: string;
  id: string;
  membership_plan_id: string | null;
};

const paymentSelect =
  "id,member_id,amount_cop,paid_at,period_start,period_end,method,source,status,screenshot_url,notes,reviewed_at,created_at";

export async function getMemberPayments({
  limit = 10,
  memberId,
  offset = 0,
}: {
  limit?: number;
  memberId: string;
  offset?: number;
}): Promise<PaymentsResult<MemberPayment>> {
  if (!hasSupabaseAdminConfig()) {
    return {
      hasMore: false,
      isConfigured: false,
      payments: [],
      setupMessage: "Falta SUPABASE_SERVICE_ROLE_KEY para leer pagos reales.",
    };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("payments")
      .select(paymentSelect)
      .eq("member_id", memberId)
      .order("paid_at", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit);

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as PaymentRow[];

    return {
      hasMore: rows.length > limit,
      isConfigured: true,
      payments: rows.slice(0, limit).map(mapMemberPayment),
    };
  } catch (error) {
    return {
      hasMore: false,
      isConfigured: true,
      payments: [],
      setupMessage:
        error instanceof Error
          ? `No se pudieron leer pagos: ${error.message}`
          : "No se pudieron leer pagos.",
    };
  }
}

export async function getAdminPayments({
  limit = 40,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}): Promise<PaymentsResult<AdminPayment>> {
  if (!hasSupabaseAdminConfig()) {
    return {
      hasMore: false,
      isConfigured: false,
      payments: [],
      setupMessage: "Falta SUPABASE_SERVICE_ROLE_KEY para leer pagos reales.",
    };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("payments")
      .select(paymentSelect)
      .order("paid_at", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit);

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as PaymentRow[];
    const memberIds = Array.from(
      new Set(rows.map((payment) => payment.member_id)),
    );
    const membersById = await loadMembersById(memberIds);

    return {
      hasMore: rows.length > limit,
      isConfigured: true,
      payments: rows.slice(0, limit).map((payment) => ({
        ...mapMemberPayment(payment),
        member: mapPaymentMember(membersById.get(payment.member_id)),
      })),
    };
  } catch (error) {
    return {
      hasMore: false,
      isConfigured: true,
      payments: [],
      setupMessage:
        error instanceof Error
          ? `No se pudieron leer pagos: ${error.message}`
          : "No se pudieron leer pagos.",
    };
  }
}

function mapMemberPayment(payment: PaymentRow): MemberPayment {
  return {
    amountCop: payment.amount_cop,
    createdAt: payment.created_at,
    id: payment.id,
    method: payment.method,
    notes: payment.notes,
    paidAt: payment.paid_at,
    periodEnd: payment.period_end,
    periodStart: payment.period_start,
    reviewedAt: payment.reviewed_at,
    screenshotUrl: payment.screenshot_url,
    source: payment.source,
    status: payment.status,
  };
}

async function loadMembersById(memberIds: string[]) {
  const membersById = new Map<string, MemberRow>();

  if (!memberIds.length) {
    return membersById;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("members")
    .select("id,full_name,email,membership_plan_id")
    .in("id", memberIds);

  if (error) {
    return membersById;
  }

  ((data ?? []) as MemberRow[]).forEach((member) => {
    membersById.set(member.id, member);
  });

  return membersById;
}

function mapPaymentMember(member: MemberRow | undefined) {
  return member
    ? {
        email: member.email,
        id: member.id,
        membershipPlanId: member.membership_plan_id,
        name: member.full_name,
      }
    : null;
}
