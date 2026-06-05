import { useCallback, useEffect, useState } from 'react'
import type { OpportunityRow, RevenueRow } from '../types'
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

  const updateRevenues = useCallback(
    (updater: (rows: RevenueRow[]) => RevenueRow[]) => {
      setData((prev) => ({ ...prev, revenues: updater(prev.revenues) }))
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

  const addRevenueRowAfter = useCallback(
    (afterId: string) => {
      updateRevenues((rows) => {
        const index = rows.findIndex((r) => r.id === afterId)
        if (index === -1) return rows
        const date = rows[index].date
        const newRow: RevenueRow = {
          id: createId(),
          date,
          project: '',
          moneyReceived: '',
          receivable: '',
          isExtra: true,
        }
        const next = [...rows]
        next.splice(index + 1, 0, newRow)
        return next
      })
    },
    [updateRevenues],
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
    revenues: data.revenues,
    isEditing,
    isDirty,
    saveMessage,
    updateOpportunities,
    updateRevenues,
    addOpportunityRowAfter,
    addRevenueRowAfter,
    startEdit,
    cancelEdit,
    save,
  }
}
