import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportDashboardPdf(
  element: HTMLElement,
  periodLabel: string,
): Promise<void> {
  element.classList.add('is-exporting')

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 8
    const imgData = canvas.toDataURL('image/png')

    const availableWidth = pageWidth - margin * 2
    const availableHeight = pageHeight - margin * 2
    const imgRatio = canvas.width / canvas.height

    let renderWidth = availableWidth
    let renderHeight = availableWidth / imgRatio

    if (renderHeight > availableHeight) {
      renderHeight = availableHeight
      renderWidth = availableHeight * imgRatio
    }

    const x = margin + (availableWidth - renderWidth) / 2
    const y = margin + (availableHeight - renderHeight) / 2

    pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight)

    const safeLabel = periodLabel.replace(/\//g, '-').replace(/\s+/g, '_')
    pdf.save(`bao-cao-tong-hop_${safeLabel}.pdf`)
  } finally {
    element.classList.remove('is-exporting')
  }
}
