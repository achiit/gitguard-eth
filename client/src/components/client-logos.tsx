
export function ClientLogos() {
  // These would normally be actual logos, but for now we'll use placeholder text with styling
  const clients = [
    "Acme Co.", "TechCorp", "DesignHub", "WebWorks", "Studio7", "DevTeam"
  ];
  
  return (
    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
      {clients.map((client, index) => (
        <div key={index} className="opacity-60 hover:opacity-100 transition-opacity">
          <div className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-bold text-lg md:text-xl">
            {client}
          </div>
        </div>
      ))}
    </div>
  );
}
