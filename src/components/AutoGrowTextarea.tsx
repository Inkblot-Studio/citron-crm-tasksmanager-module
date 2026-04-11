import { forwardRef, useLayoutEffect, useRef, useImperativeHandle, type TextareaHTMLAttributes } from 'react'

export type AutoGrowTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> & {
  /** Altura mínima en filas de texto aproximadas. */
  minRows?: number
  /** Altura máxima antes de mostrar scroll vertical. */
  maxRows?: number
}

/**
 * Textarea sin asa de redimensionar; crece con el contenido hasta maxRows.
 */
export const AutoGrowTextarea = forwardRef<HTMLTextAreaElement, AutoGrowTextareaProps>(function AutoGrowTextarea(
  { minRows = 2, maxRows = 14, className = '', value, onChange, ...props },
  ref,
) {
  const innerRef = useRef<HTMLTextAreaElement>(null)
  useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement)

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const cs = getComputedStyle(el)
    const lh = parseFloat(cs.lineHeight)
    const lineHeight = Number.isFinite(lh) && lh > 0 ? lh : parseFloat(cs.fontSize) * 1.375
    const py = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
    const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth)
    const minH = minRows * lineHeight + py + border
    const maxH = maxRows * lineHeight + py + border

    el.style.height = 'auto'
    const contentH = el.scrollHeight
    const h = Math.min(Math.max(contentH, minH), maxH)
    el.style.height = `${h}px`
    el.style.overflowY = contentH > maxH ? 'auto' : 'hidden'
  }, [value, minRows, maxRows])

  return (
    <textarea
      ref={innerRef}
      rows={1}
      value={value}
      onChange={onChange}
      className={['resize-none', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
})
