import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface SignaturePadProps {
  onSignatureCapture: (signatureData: string) => void;
}

export default function SignaturePad({ onSignatureCapture }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedSignature, setTypedSignature] = useState("");
  const [signatureMethod, setSignatureMethod] = useState<"draw" | "type">("draw");
  
  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Setup for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";
    
    // Clear canvas
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);
  
  // Handle drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Get coordinates
    let clientX: number, clientY: number;
    
    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Prevent scrolling when drawing on mobile
    if ("touches" in e) {
      e.preventDefault();
    }
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Get coordinates
    let clientX: number, clientY: number;
    
    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Prevent scrolling when drawing on mobile
    if ("touches" in e) {
      e.preventDefault();
    }
  };
  
  const stopDrawing = () => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.closePath();
    setIsDrawing(false);
    
    // Capture the signature
    const signature = canvas.toDataURL("image/png");
    onSignatureCapture(signature);
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear the captured signature
    onSignatureCapture("");
  };
  
  const handleTypedSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedSignature(e.target.value);
    
    // Only update if we have a value
    if (e.target.value) {
      // Generate a signature image from the typed text
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      canvas.width = 300;
      canvas.height = 60;
      
      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = "italic 24px serif";
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(e.target.value, canvas.width / 2, canvas.height / 2);
      
      const signature = canvas.toDataURL("image/png");
      onSignatureCapture(signature);
    } else {
      onSignatureCapture("");
    }
  };
  
  return (
    <div className="space-y-4">
      {signatureMethod === "draw" ? (
        <>
          <div 
            className="border border-gray-300 rounded-md bg-gray-50"
            style={{ height: "160px" }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            ></canvas>
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCanvas}
              type="button"
            >
              Clear Signature
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <Input
            id="typedSignature"
            name="typedSignature"
            value={typedSignature}
            onChange={handleTypedSignature}
            placeholder="Type your full name"
            className="w-full"
          />
          
          {typedSignature && (
            <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
              <p className="text-center italic text-xl font-serif">{typedSignature}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center">
        <Separator className="flex-grow" />
        <span className="px-3 text-gray-500 text-sm">or</span>
        <Separator className="flex-grow" />
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => setSignatureMethod(signatureMethod === "draw" ? "type" : "draw")}
        className="w-full"
      >
        {signatureMethod === "draw" 
          ? "Type your signature instead" 
          : "Draw your signature instead"}
      </Button>
    </div>
  );
}
