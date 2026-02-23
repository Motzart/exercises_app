import { useCallback, useRef } from 'react'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
} from '@xyflow/react'
import { format } from 'date-fns'
import '@xyflow/react/dist/style.css'
import { Button } from '~/components/ui/button'
import GoalNode, { GOAL_NODE_ID } from '~/components/graph/GoalNode'
import BlockNode from '~/components/graph/BlockNode'

const nodeTypes: NodeTypes = {
  goal: GoalNode as NodeTypes['goal'],
  block: BlockNode as NodeTypes['block'],
}

const initialNodes: Node[] = [
  {
    id: GOAL_NODE_ID,
    type: 'goal',
    position: { x: 250, y: 40 },
    data: { label: 'Goal' },
    draggable: true,
  },
]

const initialEdges: Edge[] = []

function GraphPage() {
  const blockCountRef = useRef(0)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  )

  const addBlock = useCallback(() => {
    blockCountRef.current += 1
    const id = `block-${blockCountRef.current}`
    const newNode: Node = {
      id,
      type: 'block',
      position: { x: 200 + (blockCountRef.current - 1) * 180, y: 180 },
      data: { label: 'Новий блок' },
      draggable: true,
    }
    setNodes((nds) => nds.concat(newNode))
    setEdges((eds) =>
      eds.concat({
        id: `edge-goal-${id}`,
        source: GOAL_NODE_ID,
        sourceHandle: 'goal-source',
        target: id,
        targetHandle: 'block-target',
      })
    )
  }, [setNodes, setEdges])

  const today = format(new Date(), 'dd.MM.yyyy')

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        />
      </div>
      {/* Лінія внизу сторінки: дата зліва, кнопка додати блок справа */}
      <div className="flex w-full items-center justify-between border-t-2 border-primary bg-card px-4 py-3">
        <span className="text-sm font-medium text-primary">{today}</span>
        <Button
          type="button"
          size="icon"
          variant="default"
          onClick={addBlock}
          aria-label="Додати новий блок"
          className="size-10 shrink-0 rounded-full"
        >
          <span className="text-xl font-medium leading-none">+</span>
        </Button>
      </div>
    </div>
  )
}

export default GraphPage
