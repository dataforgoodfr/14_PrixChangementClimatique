"use client";

import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RFButton } from "@/components/core/rf-button";
import SectionTitle from "./section-title";
import { cn } from "@/lib/utils";
import type { ContactFormData } from "@/lib/types/contact";

type FormErrors = Partial<Record<keyof ContactFormData, boolean>>;

export function MayorModal() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    city: "",
    email: "",
    message: "",
    insuranceQuestion: undefined,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpen = () => {
    setFormData({
      name: "",
      city: "",
      email: "",
      message: "",
    });
    setErrors({});
    setSubmitted(false);
    setOpen(true);
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {
      name: !formData.name.trim(),
      city: !formData.city.trim(),
      email: !formData.email.trim(),
      message: !formData.message.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setLoading(true);
    try {
      console.log("Envoi du formulaire:", formData);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success(
          "Message envoyé à Reclaim Finance ! Merci pour votre engagement.",
        );
      } else {
        const errorText = await res.text();
        console.error("Erreur lors de l'envoi du formulaire", errorText);
        toast.error("Erreur lors de l'envoi du message. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
      toast.error(
        "Erreur réseau. Veuillez vérifier votre connexion et réessayer.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (error: boolean | undefined) =>
    cn(
      "bg-transparent border-b pb-3 pt-1 outline-none text-lg transition-colors",
      "placeholder:transition-colors",
      error
        ? "border-red-500 text-red-500 placeholder:text-red-500"
        : "border-rf-green-light text-rf-green-dark placeholder:text-black",
    );

  return (
    <>
      <RFButton
        as="button"
        title="Agir maintenant"
        variant="quaternary"
        icon={<ArrowRight className="w-5 h-5" />}
        iconPosition="right"
        onClick={handleOpen}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-4xl gap-0 overflow-hidden overflow-y-auto bg-white p-0 max-h-[90dvh]"
        >
          {/* Header with topographic background */}
          <div className="relative flex flex-col items-center gap-4 bg-[linear-gradient(to_bottom,rgba(200,240,105,0.15)_0%,rgba(255,255,255,0.95)_100%),url('/contact-background.svg')] bg-cover bg-top p-8 text-center">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-8 top-8 text-rf-green-dark transition-opacity hover:opacity-60"
            >
              <X className="h-5 w-5" />
            </button>

            <DialogTitle className="sr-only">Je suis maire, élu.e</DialogTitle>
            <SectionTitle
              highlightVariant="primary"
              topLine={[{ parts: [{ text: "Je suis" }] }]}
              bottomLine={[
                {
                  highlight: true,
                  parts: [{ text: "maire, élu.e", bold: true }],
                },
              ]}
            />

            <p className="text-base leading-relaxed text-rf-gray">
              Construisons des solutions justes et abordables ensemble, afin de
              protéger l&apos;assurabilité des communes françaises.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-8 px-8 md:px-32 py-8 overflow-y-auto">
            <input
              type="text"
              placeholder="Prénom / Nom"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={inputClass(errors.name)}
            />

            <input
              type="text"
              placeholder="Votre ville"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className={inputClass(errors.city)}
            />

            <div className="flex flex-col gap-2">
              <label className="text-rf-green-dark font-medium text-lg">
                Votre ville est-elle assurée contre les risques climatiques ?
              </label>
              <div className="flex gap-6 md:gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="insuranceQuestion"
                    value="oui"
                    checked={formData.insuranceQuestion === "oui"}
                    onChange={() => handleChange("insuranceQuestion", "oui")}
                    className="w-5 h-5 cursor-pointer accent-rf-green-dark"
                  />
                  <span className="text-lg text-rf-green-dark">Oui</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="insuranceQuestion"
                    value="non"
                    checked={formData.insuranceQuestion === "non"}
                    onChange={() => handleChange("insuranceQuestion", "non")}
                    className="w-5 h-5 cursor-pointer accent-rf-green-dark"
                  />
                  <span className="text-lg text-rf-green-dark">Non</span>
                </label>
              </div>
            </div>

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={inputClass(errors.email)}
            />

            <textarea
              placeholder="Tapez ici votre message"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              rows={6}
              className={cn(
                "w-full bg-transparent border p-4 outline-none resize-none text-lg transition-colors",
                "placeholder:transition-colors",
                errors.message
                  ? "border-red-500 text-red-500 placeholder:text-red-500"
                  : "border-rf-green-light text-rf-green-dark placeholder:text-black",
              )}
            />

            {/* Submit */}
            <div className="flex justify-center pb-2 text-base">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || submitted}
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-5 py-2 min-w-[160px] font-bold border rounded-none transition-all duration-150",
                  "disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-default",
                  "bg-rf-green-dark text-rf-lime border-rf-lime shadow-[4px_4px_0px_var(--color-rf-lime)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 disabled:shadow-[4px_4px_0px_var(--color-rf-lime)]",
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
                ) : (
                  <>
                    Nous contacter
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}
