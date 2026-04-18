import * as React from 'react';

export const EliteBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Update CSS variables on the root or container
  const style = {
    '--mouse-x': mousePos.x,
    '--mouse-y': mousePos.y,
  } as React.CSSProperties;

  return (
    <div style={style} className="relative min-h-screen overflow-x-hidden isolate">
      <div className="mesh-bg pointer-events-none">
        <div className="mesh-blob bg-blue-400 -top-20 -left-20 animate-alive-1" />
        <div className="mesh-blob bg-indigo-500 top-40 right-0 animate-alive-2" />
        <div className="mesh-blob bg-violet-400 bottom-0 left-1/4 animate-alive-3" />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
