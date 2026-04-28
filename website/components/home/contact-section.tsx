"use client";

import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import clsx from "clsx";

interface FormData {
  name: string;
  status: string;
  email: string;
  message: string;
}

type FormErrors = Record<keyof FormData, boolean>;

const ContactSection = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    status: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: false,
    status: false,
    email: false,
    message: false,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleFailureWithTimeout = () => {
    setFailed(true);
    // Masquer l'erreur après 2 secondes
    const timer = setTimeout(() => {
      setFailed(false);
    }, 2000);
    return () => clearTimeout(timer);
  };

  const handleReset = () => {
    setErrors({ name: false, status: false, email: false, message: false });
    setFailed(false);
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {
      name: !formData.name.trim(),
      status: !formData.status.trim(),
      email: !formData.email.trim(),
      message: !formData.message.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.name,
          situation: formData.status,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        console.error("Erreur lors de l'envoi du formulaire", await res.text());
        handleFailureWithTimeout();
      }
    } catch (err) {
      console.error("Erreur réseau", err);
      handleFailureWithTimeout();
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (error: boolean) =>
    clsx(
      "w-full bg-transparent border-b pb-3 pt-1 outline-none text-[16px] md:text-[20px] transition-colors",
      "placeholder:transition-colors",
      error
        ? "border-red-500 text-red-500 placeholder:text-red-400"
        : "border-rf-green-light text-rf-green-dark placeholder:text-rf-green-light",
    );

  return (
    <section
      id="contact"
      className="max-w-[800px] mx-auto px-5 sm:px-8 md:px-10 py-16 pb-24 flex flex-col items-center gap-10"
    >
      {/* ── Titre ── */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div>
          <span className="inline-block bg-rf-green-dark text-rf-lime font-bold rotate-[-1deg] px-3 py-1 text-[32px] md:text-[44px] lg:text-[56px] leading-[110%]">
            Contactez-nous
          </span>
        </div>
        <h2 className="text-rf-green-dark font-normal text-[28px] md:text-[38px] lg:text-[48px] leading-[110%]">
          pour agir dès maintenant
        </h2>
        <p className="text-[#4E4E5C] text-[14px] md:text-[16px] mt-1">
          Vous êtes citoyen ou élu, contactez-nous dès maintenant pour en savoir
          plus
        </p>
      </div>

      {/* ── Formulaire ── */}
      <div className="w-full flex flex-col gap-8">
        <input
          type="text"
          placeholder="Prénom / Nom"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className={inputClass(errors.name)}
        />
        <input
          type="text"
          placeholder="Votre statut / situation"
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, status: e.target.value }))
          }
          className={inputClass(errors.status)}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          className={inputClass(errors.email)}
        />
        <textarea
          placeholder="Tapez ici votre message"
          value={formData.message}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, message: e.target.value }))
          }
          rows={6}
          className={clsx(
            "w-full bg-transparent border p-4 outline-none resize-none text-[16px] md:text-[20px] transition-colors",
            "placeholder:transition-colors",
            errors.message
              ? "border-red-500 text-red-500 placeholder:text-red-400"
              : "border-rf-green-light text-rf-green-dark placeholder:text-rf-green-light",
          )}
        />
      </div>

      {/* ── Bouton ── */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || submitted || failed}
        className={clsx(
          "inline-flex items-center justify-center gap-2 px-5 py-2 min-w-[160px] text-sm font-semibold border rounded-none transition-all duration-150",
          "disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-default",
          failed
            ? "bg-red-600 text-white border-red-400 shadow-[4px_4px_0px_#f87171] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            : "bg-rf-green-dark text-rf-lime border-rf-lime shadow-[4px_4px_0px_var(--color-rf-lime)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 disabled:shadow-[4px_4px_0px_var(--color-rf-lime)]",
        )}
      >
        {loading ? (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rf-lime animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-rf-lime animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-rf-lime animate-bounce [animation-delay:300ms]" />
          </span>
        ) : submitted ? (
          <Check className="w-5 h-5 animate-in zoom-in duration-300" />
        ) : failed ? (
          <X className="w-5 h-5 animate-in zoom-in duration-300" />
        ) : (
          <>
            Nous contacter
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </section>
  );
};

export default ContactSection;
