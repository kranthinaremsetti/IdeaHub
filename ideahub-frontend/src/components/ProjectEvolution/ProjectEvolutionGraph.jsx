import { useEffect, useState, useCallback } from "react";
import ReactFlow, { 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from "reactflow";
import "reactflow/dist/style.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export default function ProjectEvolutionGraph({ projectId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const buildGraph = async () => {
      try {
        setLoading(true);
        
        // Fetch current project
        const projectRes = await fetch(`${API_BASE_URL}/projects/${projectId}`);
        const projectData = await projectRes.json();
        
        if (!projectRes.ok || !projectData.project) {
          throw new Error("Project not found");
        }

        const project = projectData.project;

        // Fetch similar projects
        const similarRes = await fetch(`${API_BASE_URL}/similar-projects/${projectId}`);
        const similarData = await similarRes.json();
        const similarProjects = similarData.similar || [];

        // Initialize nodes and edges
        const newNodes = [];
        const newEdges = [];

        // Central node - the main project
        const mainNodeId = `project-${project._id}`;
        newNodes.push({
          id: mainNodeId,
          data: {
            label: (
              <div className="text-center">
                <div className="font-bold text-sm truncate">
                  {project.project_info?.project_title || "Untitled"}
                </div>
                <div className="text-xs text-gray-600">Main Project</div>
              </div>
            ),
          },
          position: { x: 0, y: 0 },
          style: {
            background: "#3b82f6",
            color: "white",
            border: "3px solid #1e40af",
            borderRadius: "8px",
            padding: "10px",
            width: "150px",
            textAlign: "center",
            fontWeight: "bold",
          },
        });

        // Related technology nodes
        const allTechs = new Set(project.project_info?.technologies_used || []);
        const techNodes = Array.from(allTechs).slice(0, 6);
        const techAngle = (2 * Math.PI) / Math.max(techNodes.length, 1);

        techNodes.forEach((tech, idx) => {
          const angle = idx * techAngle;
          const radius = 250;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          const nodeId = `tech-${tech.replace(/\s+/g, "-")}`;
          newNodes.push({
            id: nodeId,
            data: {
              label: (
                <div className="text-center">
                  <div className="text-xs font-semibold truncate">{tech}</div>
                  <div className="text-xs text-gray-600">Technology</div>
                </div>
              ),
            },
            position: { x, y },
            style: {
              background: "#fbbf24",
              color: "#333",
              border: "2px solid #d97706",
              borderRadius: "6px",
              padding: "8px",
              width: "120px",
              textAlign: "center",
              fontSize: "11px",
            },
          });

          newEdges.push({
            id: `edge-main-${nodeId}`,
            source: mainNodeId,
            target: nodeId,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: "#fbbf24", strokeWidth: 2 },
          });
        });

        // Similar projects nodes
        const similarAngle = (2 * Math.PI) / Math.max(similarProjects.length, 1);

        similarProjects.forEach((similar, idx) => {
          const angle = idx * similarAngle + Math.PI / 2;
          const radius = 400;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          const similarNodeId = `project-${similar._id}`;
          
          // Color based on similarity score
          let backgroundColor = "#10b981"; // Green for high similarity
          let borderColor = "#059669";
          if (similar.score < 70) {
            backgroundColor = "#f59e0b";
            borderColor = "#d97706";
          }
          if (similar.score < 50) {
            backgroundColor = "#ef4444";
            borderColor = "#dc2626";
          }

          newNodes.push({
            id: similarNodeId,
            data: {
              label: (
                <div className="text-center">
                  <div className="font-semibold text-sm truncate line-clamp-2">
                    {similar.project_title || "Untitled"}
                  </div>
                  <div className="text-xs text-white mt-1 font-bold">{similar.score}% Match</div>
                  {similar.project_domain && (
                    <div className="text-xs text-gray-200">{similar.project_domain}</div>
                  )}
                </div>
              ),
            },
            position: { x, y },
            style: {
              background: backgroundColor,
              color: "white",
              border: `2px solid ${borderColor}`,
              borderRadius: "8px",
              padding: "10px",
              width: "140px",
              textAlign: "center",
              fontSize: "11px",
            },
          });

          newEdges.push({
            id: `edge-${mainNodeId}-${similarNodeId}`,
            source: mainNodeId,
            target: similarNodeId,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { 
              stroke: backgroundColor,
              strokeWidth: 2,
              opacity: similar.score / 100
            },
            label: `${similar.score}%`,
            labelStyle: { fill: backgroundColor, fontWeight: "bold" },
          });
        });

        setNodes(newNodes);
        setEdges(newEdges);
        setError("");
      } catch (err) {
        setError(err.message);
        console.error("Error building graph:", err);
      } finally {
        setLoading(false);
      }
    };

    buildGraph();
  }, [projectId, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl mb-4">🌐</div>
          <p className="text-gray-600">Building project evolution graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-3xl mb-4">❌</div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-xs">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-lg">🔍</span> Legend
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 border-2 border-blue-700"></div>
            <span>Main Project</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400 border-2 border-yellow-600"></div>
            <span>Technologies Used</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 border-2"></div>
            <span>Highly Similar (70%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-400 border-2"></div>
            <span>Moderately Similar (50-70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500 border-2"></div>
            <span>Related (&lt;50%)</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t text-xs text-gray-600">
          💡 Drag nodes • Zoom with scroll • Pan the view
        </div>
      </div>
    </div>
  );
}
