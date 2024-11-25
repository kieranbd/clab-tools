interface Tool {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  url: string;
}

interface ToolCardProps {
  tool: Tool;
  onClick: () => void;
}

export default function ToolCard({ tool, onClick }: ToolCardProps) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left group bg-gray-800 rounded-xl overflow-hidden transition-transform hover:scale-105 hover:shadow-xl"
    >
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={tool.image}
          alt={tool.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold">{tool.name}</h3>
          <span className="px-3 py-1 text-sm bg-gray-700 rounded-full">
            {tool.category}
          </span>
        </div>
        <p className="text-gray-400">{tool.description}</p>
      </div>
    </button>
  );
}