interface TableRowActionsProps {
  editable: boolean
  canDelete: boolean
  addTitle: string
  onAdd: () => void
  onRemove?: () => void
}

export function TableRowActions({
  editable,
  canDelete,
  addTitle,
  onAdd,
  onRemove,
}: TableRowActionsProps) {
  if (!editable) return null

  return (
    <div className="row-action-buttons">
      <button
        type="button"
        className="btn-row-add"
        onClick={onAdd}
        title={addTitle}
        aria-label={addTitle}
      >
        +
      </button>
      {canDelete && onRemove && (
        <button
          type="button"
          className="btn-row-delete"
          onClick={onRemove}
          title="Xóa hàng"
          aria-label="Xóa hàng"
        >
          ×
        </button>
      )}
    </div>
  )
}
