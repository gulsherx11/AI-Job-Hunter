import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import html2pdf from 'html2pdf.js'

/**
 * Parses inline markdown bold (**bold**) and italics (*italic*) into docx TextRuns.
 */
function parseInlineFormatting(text, baseOptions = {}) {
  const tokens = []
  const regex = /(\*\*.*?\*\*|\*.*?\*|[^*]+)/g
  let match

  while ((match = regex.exec(text)) !== null) {
    const part = match[0]
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      tokens.push(
        new TextRun({
          ...baseOptions,
          text: part.slice(2, -2),
          bold: true,
        })
      )
    } else if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      tokens.push(
        new TextRun({
          ...baseOptions,
          text: part.slice(1, -1),
          italics: true,
        })
      )
    } else if (part.length > 0) {
      tokens.push(
        new TextRun({
          ...baseOptions,
          text: part,
        })
      )
    }
  }

  return tokens.length > 0 ? tokens : [new TextRun({ ...baseOptions, text })]
}

/**
 * Generates and downloads a clean, ATS-compliant Microsoft Word (.docx) resume.
 */
export async function downloadResumeAsDocx(markdownText, filename = 'Resume.docx') {
  if (!markdownText) return

  // Strip code fences if the LLM happened to wrap them
  const cleanedText = markdownText
    .replace(/^```[a-z]*\n/i, '')
    .replace(/\n```$/, '')
    .trim()

  const lines = cleanedText.split('\n')
  const children = []

  let isFirstHeading = true

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    // Blank line
    if (!trimmed) {
      continue
    }

    // Candidate Name (H1)
    if (trimmed.startsWith('# ')) {
      const nameText = trimmed.replace(/^#\s+/, '')
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          heading: HeadingLevel.TITLE,
          spacing: { before: 0, after: 80 },
          children: [
            new TextRun({
              text: nameText,
              font: 'Calibri',
              size: 38, // 19pt
              bold: true,
              color: '0F172A',
            }),
          ],
        })
      )
      isFirstHeading = false
      continue
    }

    // Section Headers (H2: e.g. ## PROFESSIONAL SUMMARY, ## WORK EXPERIENCE)
    if (trimmed.startsWith('## ')) {
      const sectionTitle = trimmed.replace(/^##\s+/, '').toUpperCase()
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: isFirstHeading ? 100 : 260, after: 100 },
          border: {
            bottom: {
              color: 'CBD5E1',
              space: 4,
              value: BorderStyle.SINGLE,
              size: 8,
            },
          },
          children: [
            new TextRun({
              text: sectionTitle,
              font: 'Calibri',
              size: 24, // 12pt
              bold: true,
              color: '1E3A8A', // Classic ATS Navy
            }),
          ],
        })
      )
      isFirstHeading = false
      continue
    }

    // Sub-headers (H3: e.g. ### Senior Developer — Google)
    if (trimmed.startsWith('### ')) {
      const roleTitle = trimmed.replace(/^###\s+/, '')
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 140, after: 40 },
          children: parseInlineFormatting(roleTitle, {
            font: 'Calibri',
            size: 22, // 11pt
            bold: true,
            color: '1E293B',
          }),
        })
      )
      continue
    }

    // Bullet points (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      const bulletText = trimmed.replace(/^[-*]\s+/, '')
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 20, after: 50 },
          children: parseInlineFormatting(bulletText, {
            font: 'Calibri',
            size: 21, // 10.5pt
            color: '334155',
          }),
        })
      )
      continue
    }

    // Subtitle / Location / Date italic lines (e.g. *San Francisco, CA | 2022 - Present*)
    if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
      children.push(
        new Paragraph({
          spacing: { before: 20, after: 80 },
          children: [
            new TextRun({
              text: trimmed.slice(1, -1),
              font: 'Calibri',
              size: 19, // 9.5pt
              italics: true,
              color: '64748B',
            }),
          ],
        })
      )
      continue
    }

    // Contact info header line (usually line right after Name, e.g. email | phone | location)
    if (children.length <= 2 && trimmed.includes('|')) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 180 },
          children: [
            new TextRun({
              text: trimmed,
              font: 'Calibri',
              size: 19, // 9.5pt
              color: '475569',
            }),
          ],
        })
      )
      continue
    }

    // General paragraphs (e.g. Professional Summary text)
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 80 },
        children: parseInlineFormatting(trimmed, {
          font: 'Calibri',
          size: 21, // 10.5pt
          color: '334155',
        }),
      })
    )
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,    // ~0.7 inch
              bottom: 1000,
              left: 1080,   // ~0.75 inch
              right: 1080,
            },
          },
        },
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const safeFilename = filename.endsWith('.docx') ? filename : `${filename}.docx`
  saveAs(blob, safeFilename)
}

/**
 * Generates and downloads a clean, vector/raster PDF resume using html2pdf.js
 */
export async function downloadResumeAsPdf(elementId, filename = 'Resume.pdf') {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Element with id "${elementId}" not found for PDF export.`)
    return
  }

  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`

  const opt = {
    margin: [12, 12, 12, 12], // mm (clean margins)
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      backgroundColor: '#ffffff',
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }

  await html2pdf().set(opt).from(element).save()
}

