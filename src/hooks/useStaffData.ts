import { useCallback, useEffect, useState } from 'react'
import type { OpportunityRow, ReceivableEntryRow, RevenueEntryRow } from '../types'
import { createId } from '../utils/id'
import { loadStaffData, saveStaffData } from '../utils/storage'

export function useStaffData(staffId: string, monthKey: string) {
  const [data, setData] = useState(() => loadStaffData(staffId, monthKey))
  const [isEditing, setIsEditing] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    setData(loadStaffData(staffId, monthKey))
    setIsEditing(false)
    setIsDirty(false)
    setSaveMessage('')
  }, [staffId, monthKey])

  const markDirty = useCallback(() => {
    setIsDirty(true)
    setSaveMessage('')
  }, [])

  const updateOpportunities = useCallback(
    (updater: (rows: OpportunityRow[]) => OpportunityRow[]) => {
      setData((prev) => ({ ...prev, opportunities: updater(prev.opportunities) }))
      markDirty()
    },
    [markDirty],
  )

  const updateRevenueRows = useCallback(
    (updater: (rows: RevenueEntryRow[]) => RevenueEntryRow[]) => {
      setData((prev) => ({ ...prev, revenueRows: updater(prev.revenueRows) }))
      markDirty()
    },
    [markDirty],
  )

  const updateReceivableRows = useCallback(
    (updater: (rows: ReceivableEntryRow[]) => ReceivableEntryRow[]) => {
      setData((prev) => ({ ...prev, receivableRows: updater(prev.receivableRows) }))
      markDirty()
    },
    [markDirty],
  )

  const addOpportunityRowAfter = useCallback(
    (afterId: string) => {
      updateOpportunities((rows) => {
        const index = rows.findIndex((r) => r.id === afterId)
        if (index === -1) return rows
        const date = rows[index].date
        const newRow: OpportunityRow = {
          id: createId(),
          date,
          company: '',
          source: '',
          isExtra: true,
        }
        const next = [...rows]
        next.splice(index + 1, 0, newRow)
        return next
      })
    },
    [updateOpportunities],
  )

  const removeOpportunityRow = useCallback(
    (rowId: string) => {
      updateOpportunities((rows) => {
        const row = rows.find((item) => item.id === rowId)
        if (!row?.isExtra) return rows
        return rows.filter((item) => item.id !== rowId)
      })
    },
    [updateOpportunities],
  )

  const addRevenueRowAfter = useCallback(
    (afterId: string) => {
      updateRevenueRows((rows) => {
        const index = rows.findIndex((r) => r.id === afterId)
        if (index === -1) return rows
        const date = rows[index].date
        const newRow: RevenueEntryRow = {
          id: createId(),
          date,
          project: '',
          moneyReceived: '',
          isExtra: true,
        }
        const next = [...rows]
        next.splice(index + 1, 0, newRow)
        return next
      })
    },
    [updateRevenueRows],
  )

  const removeRevenueRow = useCallback(
    (rowId: string) => {
      updateRevenueRows((rows) => {
        const row = rows.find((item) => item.id === rowId)
        if (!row?.isExtra) return rows
        return rows.filter((item) => item.id !== rowId)
      })
    },
    [updateRevenueRows],
  )

  const addReceivableRowAfter = useCallback(
    (afterId: string) => {
      updateReceivableRows((rows) => {
        const index = rows.findIndex((r) => r.id === afterId)
        if (index === -1) return rows
        const date = rows[index].date
        const newRow: ReceivableEntryRow = {
          id: createId(),
          date,
          project: '',
          receivable: '',
          isExtra: true,
        }
        const next = [...rows]
        next.splice(index + 1, 0, newRow)
        return next
      })
    },
    [updateReceivableRows],
  )

  const removeReceivableRow = useCallback(
    (rowId: string) => {
      updateReceivableRows((rows) => {
        const row = rows.find((item) => item.id === rowId)
        if (!row?.isExtra) return rows
        return rows.filter((item) => item.id !== rowId)
      })
    },
    [updateReceivableRows],
  )

  const startEdit = useCallback(() => {
    setIsEditing(true)
    setSaveMessage('')
  }, [])

  const cancelEdit = useCallback(() => {
    setData(loadStaffData(staffId, monthKey))
    setIsEditing(false)
    setIsDirty(false)
    setSaveMessage('')
  }, [staffId, monthKey])

  const save = useCallback(() => {
    saveStaffData(staffId, monthKey, data)
    setIsEditing(false)
    setIsDirty(false)
    setSaveMessage('Đã lưu báo cáo')
  }, [staffId, monthKey, data])

  return {
    opportunities: data.opportunities,
    revenueRows: data.revenueRows,
    receivableRows: data.receivableRows,
    isEditing,
    isDirty,
    saveMessage,
    updateOpportunities,
    updateRevenueRows,
    updateReceivableRows,
    addOpportunityRowAfter,
    removeOpportunityRow,
    addRevenueRowAfter,
    removeRevenueRow,
    addReceivableRowAfter,
    removeReceivableRow,
    startEdit,
    cancelEdit,
    save,
  }
}
