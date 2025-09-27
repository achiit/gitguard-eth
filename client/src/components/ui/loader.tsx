import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "white";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

const variantClasses = {
  default: "text-gray-600 border-gray-200",
  primary: "text-primary border-primary/20",
  secondary: "text-gray-500 border-gray-200",
  success: "text-green-600 border-green-200",
  warning: "text-yellow-600 border-yellow-200",
  error: "text-red-600 border-red-200",
  white: "text-white border-white/20"
};

const textVariantClasses = {
  default: "text-gray-600",
  primary: "text-primary",
  secondary: "text-gray-500",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
  white: "text-white"
};

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  variant = "default",
  className,
  text,
  fullScreen = false
}) => {
  const baseClasses = "animate-spin rounded-full border-2 border-t-transparent";
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];
  const textVariantClass = textVariantClasses[variant];
  
  const loaderElement = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn(baseClasses, sizeClass, variantClass)} />
      {text && (
        <p className={cn("text-sm font-medium animate-pulse", textVariantClass)}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-lg p-8 border">
          {loaderElement}
        </div>
      </div>
    );
  }

  return loaderElement;
};

// Spinner component for inline use
export const Spinner: React.FC<Omit<LoaderProps, 'text' | 'fullScreen'>> = (props) => {
  return <Loader {...props} />;
};

// Button loader for form submissions
export const ButtonLoader: React.FC<{ 
  className?: string; 
  variant?: "default" | "white";
  size?: "xs" | "sm" | "md";
}> = ({ 
  className, 
  variant = "white",
  size = "sm" 
}) => {
  return (
    <div className={cn("flex items-center", className)}>
      <Loader 
        size={size} 
        variant={variant} 
        className="mr-2" 
      />
    </div>
  );
};

// Page loader for full page loading states
export const PageLoader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader size="lg" variant="primary" text={text} />
    </div>
  );
};

// Card loader for loading states within cards
export const CardLoader: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader size="md" variant="primary" text={text} />
    </div>
  );
};

// Modal loader for loading states within modals
export const ModalLoader: React.FC<{ text?: string }> = ({ text = "Processing..." }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader size="md" variant="primary" text={text} />
    </div>
  );
};

// Overlay loader for loading states over content
export const OverlayLoader: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <Loader size="lg" variant="primary" text={text} />
    </div>
  );
};

export default Loader; 