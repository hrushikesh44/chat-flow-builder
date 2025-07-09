
import React, { useCallback, useState } from 'react';
import {ReactFlow, 
  addEdge, //for adding connections
  Background, //bg of map
  Controls, //controls on bottom left 
  MiniMap, //minimap on the right
  ReactFlowProvider,// function that provides everything for styling and elements inside
  type Connection,
  type Edge,
  type Node,
  useNodesState, //for node state management
  useEdgesState, //for edge state management
  Handle, //define connection points
  Position, //used inside handle by mentioning the directions
  type NodeProps,
  type NodeMouseHandler
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Text Node
const TextNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const label = (data as {label: string}).label
  return (
    <div className="p-3 border border-gray-400 rounded bg-white">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>{label}</div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

//  Node Types
const nodeTypes = {
  textNode: TextNode,
};

// initailising empty nodes and edges
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `node_${id++}`;

// component
export const Flow: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  //for connection, expects connection
  const onConnect = useCallback((connection: Edge | Connection) => {
    const sourceHasOutgoingEdge = edges.some(e => e.source === connection.source);
    if (!sourceHasOutgoingEdge) {
      const newEdge: Edge = {
        ...connection,
        id: `edge_${connection.source}-${connection.target}`,
      };
      setEdges(eds => addEdge(newEdge, eds));
    } else {
      alert('Only one outgoing edge allowed per node.');
    }
  }, [edges, setEdges]);

  const addTextNode = () => {
    const newNode: Node = {
      id: getId(),
      type: 'textNode',
      position: { x: Math.random() * 100, y: Math.random() * 100 },
      data: { label: 'New message' },
    };
    setNodes(nds => nds.concat(newNode));
  };

  //expects event and node as parameter
  const onNodeClick : NodeMouseHandler = (_, node) => {
    setSelectedNodeId(node.id);
  };

  //for text state
  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedNodes = nodes.map(n =>
      n.id === selectedNodeId ? { ...n, data: { ...n.data, label: e.target.value } } : n
    );
    setNodes(updatedNodes);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  const handleSave = () => {
    const nodesWithNoTarget = nodes.filter(n => !edges.find(e => e.source === n.id));
    if (nodes.length > 1 && nodesWithNoTarget.length > 1) {
      alert('More than one node has no outgoing edge. Fix before saving.');
      return;
    }
    console.log('Saved Flow:', { nodes, edges });
    alert('Flow saved successfully! Check console for details.');
  };

  return (
    <ReactFlowProvider>
      <div className="flex h-screen">
        <div className="w-64 p-4 border-r border-gray-300 bg-gray-100">
          {selectedNode ? (
            <>
              <h3 className="text-lg font-semibold mb-2">Settings Panel</h3>
              <input
                type="text"
                value={String(selectedNode?.data?.label ?? '')}
                onChange={onTextChange}
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => setSelectedNodeId(null)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Back
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-2">Nodes Panel</h3>
              <button
                onClick={addTextNode}
                className="mb-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Text Node
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            className="mt-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Flow
          </button>
        </div>
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default Flow;