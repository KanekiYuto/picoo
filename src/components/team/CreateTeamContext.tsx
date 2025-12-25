"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CreateTeamContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const CreateTeamContext = createContext<CreateTeamContextType | undefined>(undefined);

export function CreateTeamProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <CreateTeamContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </CreateTeamContext.Provider>
  );
}

export function useCreateTeam() {
  const context = useContext(CreateTeamContext);
  if (context === undefined) {
    throw new Error("useCreateTeam must be used within a CreateTeamProvider");
  }
  return context;
}
