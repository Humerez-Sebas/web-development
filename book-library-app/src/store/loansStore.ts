import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Loan } from '@/types'

interface LoansStore {
  loans: Loan[]
  activeLoans: Loan[]
  loading: boolean
  error: string | null
  setLoans: (loans: Loan[]) => void
  addLoan: (loan: Loan) => void
  updateLoan: (loanId: string, updates: Partial<Loan>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearLoans: () => void
}

export const useLoansStore = create<LoansStore>()(
  devtools(
    immer((set) => ({
      loans: [],
      activeLoans: [],
      loading: false,
      error: null,
      setLoans: (loans) =>
        set((state) => {
          state.loans = loans
          state.activeLoans = loans.filter((loan) => loan.status === 'active')
          state.loading = false
          state.error = null
        }),
      addLoan: (loan) =>
        set((state) => {
          state.loans.unshift(loan)
          if (loan.status === 'active') {
            state.activeLoans.unshift(loan)
          }
        }),
      updateLoan: (loanId, updates) =>
        set((state) => {
          const index = state.loans.findIndex((loan) => loan.id === loanId)
          if (index !== -1) {
            state.loans[index] = { ...state.loans[index], ...updates }
            state.activeLoans = state.loans.filter((loan) => loan.status === 'active')
          }
        }),
      setLoading: (loading) =>
        set((state) => {
          state.loading = loading
        }),
      setError: (error) =>
        set((state) => {
          state.error = error
          state.loading = false
        }),
      clearLoans: () =>
        set((state) => {
          state.loans = []
          state.activeLoans = []
          state.loading = false
          state.error = null
        }),
    })),
    { name: 'LoansStore' }
  )
)