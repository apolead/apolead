import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"
import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 2000  // 2 seconds to remove after dismissal
const DEFAULT_TOAST_DURATION = 3000  // 3 seconds visibility before auto-dismiss

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  duration?: number  // Added duration property
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: Omit<ToasterToast, "id">
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast> & Pick<ToasterToast, "id">
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
const dismissTimeouts = new Map<string, ReturnType<typeof setTimeout>>()  // Added for auto-dismiss

const addToRemoveQueue = (toastId: string) => {
  // Clear any existing timeout
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId))
    toastTimeouts.delete(toastId)
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

// New function to add auto-dismiss timeout
const addToDismissQueue = (toastId: string, duration: number = DEFAULT_TOAST_DURATION) => {
  // Don't auto-dismiss if duration is Infinity
  if (duration === Infinity) return
  
  // Clear any existing timeout
  if (dismissTimeouts.has(toastId)) {
    clearTimeout(dismissTimeouts.get(toastId))
    dismissTimeouts.delete(toastId)
  }

  const timeout = setTimeout(() => {
    dispatch({
      type: actionTypes.DISMISS_TOAST,
      toastId: toastId,
    })
    dismissTimeouts.delete(toastId)
  }, duration)

  dismissTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [
          ...state.toasts,
          { ...action.toast, id: genId() },
        ].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ duration = DEFAULT_TOAST_DURATION, ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    })
    
  const dismiss = () => {
    // Clear any auto-dismiss timeouts when manually dismissed
    if (dismissTimeouts.has(id)) {
      clearTimeout(dismissTimeouts.get(id))
      dismissTimeouts.delete(id)
    }
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })
  }
  
  // Enhanced event handler for better X button support
  const handleOpenChange = (open: boolean) => {
    // Make sure we properly call the original onOpenChange if provided
    if (props.onOpenChange) {
      props.onOpenChange(open)
    }
    
    // And also handle the dismiss if closed
    if (!open) {
      dismiss()
    }
  }

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      duration,
      open: true,
      onOpenChange: handleOpenChange,
    },
  })

  // Auto-dismiss the toast after the specified duration
  addToDismissQueue(id, duration)

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  }
}

export { useToast, toast }

export default useToast;
