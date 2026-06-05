import { Link } from 'react-router-dom'
import type { StaffSummaryRow } from '../utils/dashboard'
import { formatMoney } from '../utils/dashboard'

interface DashboardSummaryTableProps {
  periodLabel: string
  rows: StaffSummaryRow[]
  totals: {
    opportunities: number
    fromMarketing: number
    fromSelfSearch: number
    fromInternal: number
    fromCsm: number
    revenueReceived: number
    projectsToRecover: number
    amountToRecover: number
  }
}

function CountCell({ value }: { value: number }) {
  return <span className="dash-num">{value}</span>
}

function MoneyCell({ value }: { value: number }) {
  return <span className="dash-money">{formatMoney(value)}</span>
}

export function DashboardSummaryTable({ periodLabel, rows, totals }: DashboardSummaryTableProps) {
  return (
    <div className="dashboard-table-card">
      <div className="dashboard-table-banner">
        <h2>BẢNG TỔNG HỢP KẾT QUẢ BÁN HÀNG VÀ CÔNG NỢ</h2>
        <p className="dashboard-table-period">{periodLabel}</p>
      </div>

      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr className="dash-head-row-main">
              <th rowSpan={2} className="col-staff">Nhân sự</th>
              <th rowSpan={2} className="col-count">Cơ hội bán hàng</th>
              <th colSpan={4} className="col-source-group">Nguồn khách hàng</th>
              <th rowSpan={2} className="col-money">Doanh thu tiền về</th>
              <th rowSpan={2} className="col-count">Số DA cần thu hồi</th>
              <th rowSpan={2} className="col-money">Số tiền cần thu hồi</th>
            </tr>
            <tr className="dash-head-row-sub">
              <th>Từ Marketing</th>
              <th>Từ Tự tìm kiếm</th>
              <th>Từ Nội bộ</th>
              <th>Từ CSM</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.staffId} className={index % 2 === 0 ? 'dash-row-even' : 'dash-row-odd'}>
                <td className="col-staff">
                  <Link to={`/staff/${row.staffId}`} className="dash-staff-link">
                    {row.staffName}
                  </Link>
                </td>
                <td className="col-count"><CountCell value={row.opportunities} /></td>
                <td className="col-count"><CountCell value={row.fromMarketing} /></td>
                <td className="col-count"><CountCell value={row.fromSelfSearch} /></td>
                <td className="col-count"><CountCell value={row.fromInternal} /></td>
                <td className="col-count"><CountCell value={row.fromCsm} /></td>
                <td className="col-money"><MoneyCell value={row.revenueReceived} /></td>
                <td className="col-count"><CountCell value={row.projectsToRecover} /></td>
                <td className="col-money"><MoneyCell value={row.amountToRecover} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="dash-total-row">
              <td className="col-staff">Tổng cộng</td>
              <td className="col-count"><CountCell value={totals.opportunities} /></td>
              <td className="col-count"><CountCell value={totals.fromMarketing} /></td>
              <td className="col-count"><CountCell value={totals.fromSelfSearch} /></td>
              <td className="col-count"><CountCell value={totals.fromInternal} /></td>
              <td className="col-count"><CountCell value={totals.fromCsm} /></td>
              <td className="col-money"><MoneyCell value={totals.revenueReceived} /></td>
              <td className="col-count"><CountCell value={totals.projectsToRecover} /></td>
              <td className="col-money"><MoneyCell value={totals.amountToRecover} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
