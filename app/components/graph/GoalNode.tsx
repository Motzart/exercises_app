import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { cn } from '~/lib/utils'

const GOAL_NODE_ID = 'goal'

export { GOAL_NODE_ID }

type GoalNodeType = Node<{ label?: string }, 'goal'>

function GoalNode(props: NodeProps<GoalNodeType>) {
  const { data } = props
  return (
    <div
      className={cn(
        'rounded-lg border-2 border-primary bg-card px-6 py-4 shadow-md',
        'min-w-[180px] text-center'
      )}
    >
      <div className="font-medium underline decoration-primary underline-offset-2">
        {data?.label ?? 'Goal'}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="goal-source"
        className="bottom-[-6px]! h-3! w-3! border-2! border-primary! bg-primary!"
      />
    </div>
  )
}

export default GoalNode
