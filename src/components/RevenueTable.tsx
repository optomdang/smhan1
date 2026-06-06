import type { RevenueEntryRow } from '../types'
import { TableRowActions } from './TableRowActions'
import { formatCurrency, formatCurrencyNumber, parseCurrency } from '../utils/format'
import { formatDisplayDate, getDaysInMonth, parseMonthKey } from '../utils/date'
import { getDateRowSpan, isFirstRowOfDate } from '../utils/table'

interface RevenueTableProps {
  rows: RevenueEntryRow[]
  monthKey: string
  editable?: boolean
  onChange: (rows: RevenueEntryRow[]) => void
  onAddRowAfter: (afterId: string) => void
  onRemoveRow: (rowId: string) => void
}

function getDayIndex(date: string, monthKey: string): number {
  const { year, month } = parseMonthKey(monthKey)
  const days = getDaysInMonth(year, month)
  return days.indexOf(date)
}

export function RevenueTable({
  rows,
  monthKey,
  editable = true,
  onChange,
  onAddRowAfter,
  onRemoveRow,
}: RevenueTableProps) {
  const updateRow = (id: string, patch: Partial<RevenueEntryRow>) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  const totalProjects = rows.filter((row) => row.project.trim()).length
  const totalMoneyReceived = rows.reduce(
    (sum, row) => sum + parseCurrency(row.moneyReceived),
    0,
  )

  return (
    <section className={`report-panel report-panel-revenue${editable ? '' : ' report-panel-readonly'}`}>
      <div className="panel-header">
        <h2>DOANH SỐ</h2>
      </div>

      <div className="table-wrap">
        <table className="report-table report-table-revenue">
          <thead>
            <tr>
              <th className="col-date">Ngày</th>
              <th className="col-project">Dự án</th>
              <th className="col-money">Tiền về</th>
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
                  <td className="col-project">
                    <input
                      type="text"
                      value={row.project}
                      onChange={(e) => updateRow(row.id, { project: e.target.value })}
                      placeholder="Nhập tên dự án"
                      disabled={!editable}
                      readOnly={!editable}
                    />
                  </td>
                  <td className="col-money">
                    <div className="currency-input">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={row.moneyReceived}
                        onChange={(e) =>
                          updateRow(row.id, { moneyReceived: formatCurrency(e.target.value) })
                        }
                        placeholder="0"
                        disabled={!editable}
                        readOnly={!editable}
                      />
                      <span className="currency-suffix">đ</span>
                    </div>
                  </td>
                  <td className="col-actions">
                    <TableRowActions
                      editable={editable}
                      canDelete={Boolean(row.isExtra)}
                      addTitle="Thêm dự án cùng ngày"
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
              <td className="col-project col-total-value">{totalProjects}</td>
              <td className="col-money col-total-value">
                {formatCurrencyNumber(totalMoneyReceived)} đ
              </td>
              <td className="col-actions" />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
