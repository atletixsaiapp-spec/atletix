"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";
import type { MemberOnboardingRecord } from "@/lib/auth";

const goals = [
  "Bajar grasa",
  "Ganar masa muscular",
  "Tonificar",
  "Fuerza",
  "Salud general",
];

const genderOptions = [
  { label: "Mujer", value: "woman" },
  { label: "Hombre", value: "man" },
  { label: "No binario", value: "non_binary" },
  { label: "Otro", value: "other" },
  { label: "Prefiero no decirlo", value: "prefer_not" },
];

type OnboardingValues = {
  currentWeightKg: string;
  dateOfBirth: string;
  fullName: string;
  gender: string;
  goal: string;
  heightCm: string;
  phone: string;
};

type StepKey = keyof OnboardingValues;

const steps: {
  description: string;
  inputMode?: "decimal" | "tel";
  key: StepKey;
  label: string;
  optional?: boolean;
  placeholder?: string;
  suffix?: string;
  title: string;
  type: "date" | "number" | "select" | "tel" | "text";
}[] = [
  {
    description: "Así aparecerá tu nombre dentro de ATLETIX.",
    key: "fullName",
    label: "Nombre completo",
    placeholder: "Tu nombre completo",
    title: "¿Cuál es tu nombre completo?",
    type: "text",
  },
  {
    description: "Lo usamos para contacto administrativo y recordatorios importantes.",
    inputMode: "tel",
    key: "phone",
    label: "Teléfono",
    placeholder: "WhatsApp",
    title: "¿Cuál es tu número de teléfono?",
    type: "tel",
  },
  {
    description: "Con esta fecha calculamos tu edad sin guardar campos duplicados.",
    key: "dateOfBirth",
    label: "Fecha de nacimiento",
    title: "¿Cuál es tu fecha de nacimiento?",
    type: "date",
  },
  {
    description: "Este dato es opcional y puedes saltarlo si prefieres.",
    key: "gender",
    label: "Género",
    optional: true,
    title: "¿Cómo quieres registrar tu género?",
    type: "select",
  },
  {
    description: "Ayuda al equipo a ajustar tu rutina inicial.",
    key: "goal",
    label: "Objetivo",
    title: "¿Cuál es tu objetivo principal?",
    type: "select",
  },
  {
    description: "Tu estatura ayuda a interpretar mejor tu progreso físico.",
    inputMode: "decimal",
    key: "heightCm",
    label: "Estatura",
    placeholder: "Ej. 165",
    suffix: "cm",
    title: "¿Cuál es tu estatura?",
    type: "number",
  },
  {
    description:
      "Esta será tu primera medición de progreso. Después podrás registrar tu peso cada vez que quieras.",
    inputMode: "decimal",
    key: "currentWeightKg",
    label: "Peso de hoy",
    placeholder: "Ej. 62.5",
    suffix: "kg",
    title: "¿Cuál es tu peso de hoy?",
    type: "number",
  },
];

const fieldClass =
  "mt-4 min-h-14 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-base font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ff2fa8]/60";
const labelClass =
  "text-[0.72rem] font-black uppercase tracking-[0.16em] text-zinc-500";

export function OnboardingForm({
  action,
  member,
}: {
  action: (formData: FormData) => Promise<void> | void;
  member: MemberOnboardingRecord | null;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<OnboardingValues>({
    currentWeightKg: stringifyNumber(
      member?.current_weight_kg ?? member?.initial_weight_kg,
    ),
    dateOfBirth: member?.date_of_birth ?? "",
    fullName: member?.full_name ?? "",
    gender: "",
    goal: member?.goal ?? "Salud general",
    heightCm: stringifyNumber(member?.height_cm),
    phone: member?.phone ?? "",
  });

  const currentStep = steps[stepIndex] ?? steps[0]!;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;
  const currentValue = values[currentStep.key];
  const isCurrentStepValid = useMemo(
    () => isStepValid(currentStep.key, currentValue, currentStep.optional),
    [currentStep, currentValue],
  );
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  function updateValue(value: string) {
    setValues((current) => ({
      ...current,
      [currentStep.key]: value,
    }));
  }

  function goNext() {
    if (!isCurrentStepValid || isLastStep) {
      return;
    }

    setStepIndex((current) => current + 1);
  }

  function goBack() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  return (
    <form
      action={action}
      className="mt-8"
      onKeyDown={(event) => {
        if (event.key === "Enter" && !isLastStep) {
          event.preventDefault();
          goNext();
        }
      }}
    >
      {Object.entries(values).map(([name, value]) => (
        <input key={name} name={name} type="hidden" value={value} />
      ))}

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
          <span>
            Paso {stepIndex + 1} de {steps.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#ff2fa8] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <p className={labelClass}>{currentStep.label}</p>
        <h2 className="mt-3 text-xl font-black tracking-normal text-white sm:text-2xl">
          {currentStep.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {currentStep.description}
        </p>

        {renderStepField({
          step: currentStep,
          updateValue,
          value: currentValue,
        })}
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-[0.45fr_1fr]">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isFirstStep}
          onClick={goBack}
          type="button"
        >
          <ArrowLeft size={18} />
          Atrás
        </button>

        {isLastStep ? (
          <PendingSubmitButton
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff58b9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8bd8]"
            disabled={!isCurrentStepValid}
            pendingLabel="Guardando perfil..."
          >
            <CheckCircle2 size={18} />
            Completar perfil
          </PendingSubmitButton>
        ) : (
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff58b9] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isCurrentStepValid}
            onClick={goNext}
            type="button"
          >
            Siguiente
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </form>
  );
}

function renderStepField({
  step,
  updateValue,
  value,
}: {
  step: (typeof steps)[number];
  updateValue: (value: string) => void;
  value: string;
}) {
  if (step.key === "goal") {
    return (
      <select
        autoFocus
        className={fieldClass}
        key={step.key}
        onChange={(event) => updateValue(event.target.value)}
        value={value}
      >
        {goals.map((goal) => (
          <option key={goal} value={goal}>
            {goal}
          </option>
        ))}
      </select>
    );
  }

  if (step.key === "gender") {
    return (
      <select
        autoFocus
        className={fieldClass}
        key={step.key}
        onChange={(event) => updateValue(event.target.value)}
        value={value}
      >
        <option value="">Prefiero no decirlo</option>
        {genderOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="relative">
      <input
        autoFocus
        className={`${fieldClass} ${step.suffix ? "pr-16" : ""}`}
        inputMode={step.inputMode}
        key={step.key}
        min={step.type === "number" ? "1" : undefined}
        onChange={(event) => updateValue(event.target.value)}
        placeholder={step.placeholder}
        step={step.type === "number" ? "0.1" : undefined}
        type={step.type}
        value={value}
      />
      {step.suffix ? (
        <span className="pointer-events-none absolute bottom-4 right-4 text-sm font-black uppercase tracking-[0.12em] text-zinc-600">
          {step.suffix}
        </span>
      ) : null}
    </div>
  );
}

function isStepValid(key: StepKey, value: string, optional = false) {
  if (optional) {
    return true;
  }

  if (key === "heightCm" || key === "currentWeightKg") {
    const number = Number(value);

    return Number.isFinite(number) && number > 0;
  }

  return value.trim().length > 0;
}

function stringifyNumber(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}
