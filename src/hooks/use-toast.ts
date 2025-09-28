import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// Simple context-based toast system
interface ToastContextType {
  toasts: ToasterToast[]
  toast: (props: Omit<ToasterToast, "id">) => void
  dismiss: (toastId?: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

let toastIdCounter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  const toast = React.useCallback((props: Omit<ToasterToast, "id">) => {
    const id = (++toastIdCounter).toString()

    const newToast: ToasterToast = {
      ...props,
      id,
      open: true,
    }

    setToasts(prev => [newToast, ...prev].slice(0, 1)) // Keep only 1 toast

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const dismiss = React.useCallback((toastId?: string) => {
    if (toastId) {
      setToasts(prev => prev.filter(t => t.id !== toastId))
    } else {
      setToasts([])
    }
  }, [])

  const value = React.useMemo(() => ({
    toasts,
    toast,
    dismiss
  }), [toasts, toast, dismiss])

  return React.createElement(
    ToastContext.Provider,
    { value },
    children
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Export for backward compatibility
export const toast = (props: Omit<ToasterToast, "id">) => {
  console.log('Toast:', props.title, props.description)
}