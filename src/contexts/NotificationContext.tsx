import React, { createContext, useContext, useEffect, useState } from "react";
import { onMessageListener } from "../services/firebase";
import { toast } from "react-toast";
import { useQueryClient } from "@tanstack/react-query";

interface NotificationContextType {
  hasPushPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  }
  return context;
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasPushPermission, setHasPushPermission] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Vérifier l'état de la permission au chargement
    if ("Notification" in window) {
      setHasPushPermission(Notification.permission === "granted");
    }

    // Écouter les messages Firebase en Foreground (quand l'app est ouverte)
    const listenToMessages = async () => {
      try {
        const payload: any = await onMessageListener();

        // On vérifie qu'on a bien reçu un payload de notification
        if (payload?.notification) {
          const { title, body } = payload.notification;

          // 1. Afficher un toast visuel à l'utilisateur
          toast.info(
            <div className="flex flex-col">
              <span className="font-bold">{title}</span>
              <span className="text-sm">{body}</span>
            </div>,
          );

          // 2. Invalider les requêtes "notifications" pour forcer le dropdown
          // et la page de notifications à se rafraîchir et afficher le nouveau badge
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }

        // On relance l'écoute pour le prochain message
        listenToMessages();
      } catch (err) {
        console.error(
          "Erreur avec l'écouteur de notifications Firebase :",
          err,
        );
      }
    };

    listenToMessages();
  }, [queryClient]);

  return (
    <NotificationContext.Provider value={{ hasPushPermission }}>
      {children}
    </NotificationContext.Provider>
  );
}
