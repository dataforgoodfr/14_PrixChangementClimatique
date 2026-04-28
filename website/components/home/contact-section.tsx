"use client";

import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import clsx from "clsx";

interface FormData {
  name: string;
  userType: "citoyen" | "maire_ou_elu";
  city: string;
  insuranceQuestion?: "oui" | "non";
  email: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, boolean>>;

const ContactSection = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    userType: "citoyen",
    city: "",
    insuranceQuestion: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: false,
    userType: false,
    city: false,
    email: false,
    message: false,
  });

  const isMayor = formData.userType === "maire_ou_elu";

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
    setErrors({
      name: false,
      userType: false,
      city: false,
      ...(isMayor && { insuranceQuestion: false }),
      email: false,
      message: false,
    });
    setFailed(false);
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {
      name: !formData.name.trim(),
      userType: !formData.userType,
      city: !formData.city.trim(),
      ...(isMayor && {
        insuranceQuestion: !formData.insuranceQuestion,
      }),
      email: !formData.email.trim(),
      message: !formData.message.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const payload: any = {
        nom: formData.name,
        type_utilisateur: formData.userType,
        ville: formData.city,
        email: formData.email,
        message: formData.message,
      };

      if (isMayor && formData.insuranceQuestion) {
        payload.assurance_climatique = formData.insuranceQuestion;
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        ? "border-red-500 text-red-500 placeholder:text-red-500"
        : "border-rf-green-light text-rf-green-dark placeholder:text-black",
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
          Vous êtes citoyen.ne ou élu.e, contactez-nous dès maintenant pour en
          savoir plus
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
          placeholder="Votre ville"
          value={formData.city}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, city: e.target.value }))
          }
          className={inputClass(errors.city)}
        />

        {/* ── Sélecteur Vous êtes: ── */}
        <div className="flex flex-col gap-2">
          <label className="text-rf-green-dark font-medium text-[16px] md:text-[18px]">
            Vous êtes:
          </label>
          <div className="flex gap-6 md:gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="userType"
                value="citoyen"
                checked={formData.userType === "citoyen"}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, userType: "citoyen" }))
                }
                className="w-5 h-5 cursor-pointer accent-rf-green-dark"
              />
              <span className="text-[16px] md:text-[18px] text-rf-green-dark">
                Citoyen.ne
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="userType"
                value="maire_ou_elu"
                checked={formData.userType === "maire_ou_elu"}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, userType: "maire_ou_elu" }))
                }
                className="w-5 h-5 cursor-pointer accent-rf-green-dark"
              />
              <span className="text-[16px] md:text-[18px] text-rf-green-dark">
                Maire ou élu.e
              </span>
            </label>
          </div>
        </div>

        {/* ── Sélecteur conditionnel pour maire/élu ── */}
        {isMayor && (
          <div className="flex flex-col gap-2">
            <label className="text-rf-green-dark font-medium text-[16px] md:text-[18px]">
              Votre ville est-elle assurée contre les risques climatiques ?
            </label>
            <div className="flex gap-6 md:gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="insuranceQuestion"
                  value="oui"
                  checked={formData.insuranceQuestion === "oui"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      insuranceQuestion: "oui",
                    }))
                  }
                  className="w-5 h-5 cursor-pointer accent-rf-green-dark"
                />
                <span className="text-[16px] md:text-[18px] text-rf-green-dark">
                  Oui
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="insuranceQuestion"
                  value="non"
                  checked={formData.insuranceQuestion === "non"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      insuranceQuestion: "non",
                    }))
                  }
                  className="w-5 h-5 cursor-pointer accent-rf-green-dark"
                />
                <span className="text-[16px] md:text-[18px] text-rf-green-dark">
                  Non
                </span>
              </label>
            </div>
          </div>
        )}

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
              ? "border-red-500 text-red-500 placeholder:text-red-500"
              : "border-rf-green-light text-rf-green-dark placeholder:text-black",
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
