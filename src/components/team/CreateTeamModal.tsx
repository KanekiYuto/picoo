"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (team: any) => void;
}

export function CreateTeamModal({ isOpen, onClose, onSuccess }: CreateTeamModalProps) {
  const t = useTranslations("common.team.createModal");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/team/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create team");
      }

      console.log("Team created:", data);

      // 重置表单
      setName("");
      setDescription("");

      // 调用成功回调
      onSuccess?.(data);

      // 关闭模态框
      onClose();
    } catch (err) {
      console.error("Failed to create team:", err);
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName("");
      setDescription("");
      setError("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
          />

          {/* 模态框内容 */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 装饰性渐变背景 */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10" />

              {/* Header */}
              <div className="relative pt-6 pb-6 px-6 md:px-8">
                <div className="flex items-start justify-between">
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-foreground"
                  >
                    {t("title")}
                  </motion.h2>
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="flex items-center justify-center h-9 w-9 rounded-full bg-sidebar-bg/80 backdrop-blur-sm border border-border text-muted hover:bg-sidebar-hover hover:text-foreground transition-all disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm text-muted-foreground"
                >
                  {t("subtitle")}
                </motion.p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 md:px-8 pb-8 space-y-5">
                {/* 错误提示 */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                        <p className="text-sm text-red-500 font-medium">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 团队名称 */}
                <div className="space-y-2.5">
                  <label htmlFor="team-name" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {t("nameLabel")}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="team-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    maxLength={50}
                    required
                    disabled={loading}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {name.length}/50 {t("characters")}
                    </p>
                    <div className="h-1 w-20 bg-sidebar-bg rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary-hover"
                        initial={{ width: 0 }}
                        animate={{ width: `${(name.length / 50) * 100}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>
                </div>

                {/* 团队描述 */}
                <div className="space-y-2.5">
                  <label htmlFor="team-description" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {t("descriptionLabel")}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({t("optional")})
                    </span>
                  </label>
                  <Textarea
                    id="team-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("descriptionPlaceholder")}
                    rows={3}
                    maxLength={200}
                    disabled={loading}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {description.length}/200 {t("characters")}
                    </p>
                    <div className="h-1 w-20 bg-sidebar-bg rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary/60 to-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(description.length / 200) * 100}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>
                </div>

                {/* 按钮组 */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-5 py-3.5 bg-sidebar-bg hover:bg-sidebar-hover border border-border text-foreground text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="flex-1 px-5 py-3.5 bg-gradient-to-r from-primary to-primary-hover text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-4 w-4 rounded-full"
                          style={{
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderTopColor: 'white',
                          }}
                        />
                        {t("creating")}
                      </span>
                    ) : (
                      t("create")
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
