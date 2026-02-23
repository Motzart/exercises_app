import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { cn } from '~/lib/utils'

export type BlockNodeType = Node<{ label?: string }, 'block'>

function BlockNode(props: NodeProps<BlockNodeType>) {
  const { data } = props
  return (
    <div
      className={cn(
        'rounded-lg border-2 border-border bg-card px-4 py-3 shadow-sm',
        'min-w-[140px] text-center'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="block-target"
        className="top-[-6px]! h-3! w-3! border-2! border-border! bg-muted-foreground/50!"
      />
      <div className="text-sm text-muted-foreground">
        {data?.label ?? 'Новий блок'}
      </div>
    </div>
  )
}

export default BlockNode
