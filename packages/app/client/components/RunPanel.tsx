import React, { useEffect, useRef } from 'react'
// @ts-ignore
import ansiHtml from 'ansi-html'

ansiHtml.setColors({
  red: 'ca372d',
  green: '4c7b3a',
  yellow: 'c6c964',
  blue: '4387cf',
  magenta: 'b86cb4',
  cyan: '71d2c4',
  white: 'c3cac1',
  gray: '9a9b99',
})

type TProps = {
  data: string[]
}

function RunPanel(props: TProps) {
  const { data } = props
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const n = requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }
    })
    return () => {
      cancelAnimationFrame(n)
    }
  })
  return (
    <div
      ref={containerRef}
      style={{ whiteSpace: 'pre-wrap' }}
      className="max-h-40vh overflow-auto -ml-38px rounded-1 p-2 bg-#191919 text-#c3cac1 hlink-run-container"
      dangerouslySetInnerHTML={{
        __html: Array.from(new Set(data)).map(ansiHtml).join('\n'),
      }}
    />
  )
}

export default RunPanel
