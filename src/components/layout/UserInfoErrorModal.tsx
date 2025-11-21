import { AlertTriangle, RefreshCw, LogOut } from "lucide-react";

interface UserInfoErrorModalProps {
  isOpen: boolean;
  onRetry: () => void;
  onLogout: () => void;
  errorMessage?: string;
}

export function UserInfoErrorModal({
  isOpen,
  onRetry,
  onLogout,
  errorMessage = "Impossible de récupérer vos informations utilisateur",
}: UserInfoErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Erreur de chargement
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{errorMessage}</p>
                <p className="mt-2 text-sm text-gray-500">
                  Veuillez réessayer ou vous reconnecter.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="mt-3 inline-flex w-full justify-center items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:mt-0 sm:w-auto"
            >
              <LogOut className="h-4 w-4" />
              Se reconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
