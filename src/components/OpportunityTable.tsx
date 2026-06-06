import type { OpportunityRow } from '../types'
import { TableRowActions } from './TableRowActions'
import { SOURCE_OPTIONS } from '../types'
import { formatDisplayDate, getDaysInMonth, parseMonthKey } from '../utils/date'
import { getDateRowSpan, isFirstRowOfDate } from '../utils/table'

interface OpportunityTableProps {
  rows: OpportunityRow[]
  monthKey: string
  editable?: boolean
  onChange: (rows: OpportunityRow[]) => void
  onAddRowAfter: (afterId: string) => void
  onRemoveRow: (rowId: string) => void
}

function getDayIndex(date: string, monthKey: string): number {
  const { year, month } = parseMonthKey(monthKey)
  const days = getDaysInMonth(year, month)
  return days.indexOf(date)
}

export function OpportunityTable({
  rows,
  monthKey,
  editable = true,
  onChange,
  onAddRowAfter,
  onRemoveRow,
}: OpportunityTableProps) {
  const updateRow = (id: string, patch: Partial<OpportunityRow>) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  const totalCompanies = rows.filter((row) => row.company.trim()).length

  return (
    <section className={`report-panel report-panel-opportunity${editable ? '' : ' report-panel-readonly'}`}>
      <div className="panel-header">
        <h2>BÁO CÁO CƠ HỘI</h2>
      </div>

      <div className="table-wrap">
        <table className="report-table report-table-opportunity">
          <thead>
            <tr>
              <th className="col-date">Ngày</th>
              <th className="col-company">Tên công ty</th>
              <th className="col-source">Nguồn</th>
              <th className="col-actions" aria-label="Thao tác" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const dayIndex = getDayIndex(row.date, monthKey)
              const shade = dayIndex >= 0 ? dayIndex % 2 : 0
              const showDate = isFirstRowOfDate(rows, index)
              return (
                <tr key={row.id} className={shade === 0 ? 'day-even' : 'day-odd'}>
                  {showDate && (
                    <td className="col-date" rowSpan={getDateRowSpan(rows, index)}>
                      {formatDisplayDate(row.date)}
                    </td>
                  )}
                  <td className="col-company">
                    <input
                      type="text"
                      value={row.company}
                      onChange={(e) => updateRow(row.id, { company: e.target.value })}
                      placeholder="Nhập tên công ty"
                      disabled={!editable}
                      readOnly={!editable}
                    />
                  </td>
                  <td className="col-source">
                    <select
                      value={row.source}
                      onChange={(e) =>
                        updateRow(row.id, {
                          source: e.target.value as OpportunityRow['source'],
                        })
                      }
                      disabled={!editable}
                    >
                      <option value="">-- Chọn nguồn --</option>
                      {SOURCE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="col-actions">
                    <TableRowActions
                      editable={editable}
                      canDelete={Boolean(row.isExtra)}
                      addTitle="Thêm công ty cùng ngày"
                      onAdd={() => onAddRowAfter(row.id)}
                      onRemove={() => onRemoveRow(row.id)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="table-total-row">
              <td className="col-date">Tổng</td>
              <td className="col-company col-total-value">{totalCompanies}</td>
              <td className="col-source" />
              <td className="col-actions" />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
