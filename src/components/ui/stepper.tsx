import React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  optional?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "dots" | "progress";
  allowClickableSteps?: boolean;
  className?: string;
}

interface StepProps {
  step: Step;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isClickable: boolean;
  onClick?: () => void;
  orientation: "horizontal" | "vertical";
  isLast: boolean;
}

const StepComponent: React.FC<StepProps> = ({
  step,
  index,
  isActive,
  isCompleted,
  isClickable,
  onClick,
  orientation,
  isLast,
}) => {
  const stepNumber = index + 1;

  return (
    <div
      className={cn(
        "flex items-center",
        orientation === "vertical" ? "flex-col" : "flex-row",
        isClickable && "cursor-pointer group"
      )}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Step indicator */}
      <div className="flex items-center">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
            isCompleted
              ? "bg-primary border-primary text-primary-foreground"
              : isActive
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-background border-muted-foreground/30 text-muted-foreground",
            isClickable && "group-hover:border-primary/50"
          )}
        >
          {isCompleted ? (
            <Check className="w-5 h-5" />
          ) : step.icon ? (
            step.icon
          ) : (
            <span className="text-sm font-semibold">{stepNumber}</span>
          )}
        </div>

        {/* Connector line for horizontal orientation */}
        {orientation === "horizontal" && !isLast && (
          <div
            className={cn(
              "w-12 h-0.5 mx-2 transition-colors duration-200",
              isCompleted ? "bg-primary" : "bg-muted-foreground/30"
            )}
          />
        )}
      </div>

      {/* Step content */}
      <div
        className={cn(
          "ml-4",
          orientation === "vertical" ? "pb-8" : "ml-0 mt-2",
          orientation === "horizontal" && "text-center min-w-0"
        )}
      >
        <div
          className={cn(
            "font-medium text-sm transition-colors duration-200",
            isActive
              ? "text-primary"
              : isCompleted
              ? "text-foreground"
              : "text-muted-foreground",
            isClickable && "group-hover:text-primary"
          )}
        >
          {step.title}
          {step.optional && (
            <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
          )}
        </div>
        {step.description && (
          <div className="text-xs text-muted-foreground mt-1 max-w-32">
            {step.description}
          </div>
        )}
      </div>

      {/* Connector line for vertical orientation */}
      {orientation === "vertical" && !isLast && (
        <div
          className={cn(
            "w-0.5 h-8 ml-5 -mt-2 transition-colors duration-200",
            isCompleted ? "bg-primary" : "bg-muted-foreground/30"
          )}
        />
      )}
    </div>
  );
};

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  orientation = "horizontal",
  variant = "default",
  allowClickableSteps = false,
  className,
}) => {
  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center space-x-2", className)}>
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => allowClickableSteps && onStepClick?.(index)}
            disabled={!allowClickableSteps}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-200",
              index < currentStep
                ? "bg-primary"
                : index === currentStep
                ? "bg-primary"
                : "bg-muted-foreground/30",
              allowClickableSteps && "hover:scale-110 cursor-pointer"
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === "progress") {
    const progress = ((currentStep + 1) / steps.length) * 100;
    return (
      <div className={cn("w-full", className)}>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-muted-foreground/20 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-sm font-medium text-foreground">
          {steps[currentStep]?.title}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex",
        orientation === "horizontal" ? "items-start justify-between" : "flex-col",
        className
      )}
    >
      {steps.map((step, index) => (
        <StepComponent
          key={step.id}
          step={step}
          index={index}
          isActive={index === currentStep}
          isCompleted={index < currentStep}
          isClickable={allowClickableSteps && (index < currentStep || index === currentStep)}
          onClick={() => onStepClick?.(index)}
          orientation={orientation}
          isLast={index === steps.length - 1}
        />
      ))}
    </div>
  );
};

// Mobile stepper component
interface MobileStepperProps {
  steps: Step[];
  currentStep: number;
  onNext?: () => void;
  onBack?: () => void;
  variant?: "text" | "dots" | "progress";
  className?: string;
}

export const MobileStepper: React.FC<MobileStepperProps> = ({
  steps,
  currentStep,
  onNext,
  onBack,
  variant = "dots",
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-between p-4 bg-background border-t", className)}>
      <button
        onClick={onBack}
        disabled={currentStep === 0}
        className={cn(
          "flex items-center text-sm font-medium transition-colors",
          currentStep === 0
            ? "text-muted-foreground cursor-not-allowed"
            : "text-primary hover:text-primary/80"
        )}
      >
        Back
      </button>

      <div className="flex-1 flex justify-center">
        {variant === "text" && (
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} / {steps.length}
          </span>
        )}
        {variant === "dots" && (
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentStep ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        )}
        {variant === "progress" && (
          <div className="w-24 bg-muted-foreground/20 rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={currentStep === steps.length - 1}
        className={cn(
          "flex items-center text-sm font-medium transition-colors",
          currentStep === steps.length - 1
            ? "text-muted-foreground cursor-not-allowed"
            : "text-primary hover:text-primary/80"
        )}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );
};

export default Stepper;