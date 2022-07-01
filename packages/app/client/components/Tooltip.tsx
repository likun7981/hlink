import { isMobile } from '../kit'
import { Tooltip as AntTooltip, TooltipProps } from 'antd'

function Tooltip(props: TooltipProps) {
  const { children, ...otherProps } = props
  if (isMobile()) {
    return <>{children}</>
  }
  return <AntTooltip {...otherProps}>{children}</AntTooltip>
}

export default Tooltip
